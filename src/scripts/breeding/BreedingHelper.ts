/**
 * Created by dennis on 12-07-17.
 */
class BreedingHelper {

    public static openBreedingModal() {
        Game.gameState(GameConstants.GameState.paused);
        $('#breedingModal').modal('show')
    }

    public static progressEggs(amount: number) {
        if (OakItemRunner.isActive("Blaze Casette")) {
            amount *= OakItemRunner.calculateBonus("Blaze Casette")
        }
        amount = Math.round(amount);
        for (let obj of player.eggList) {
            let egg: Egg = obj();
            if (egg == null || egg.notified) {
                continue;
            }
            egg.steps(egg.steps() + amount);
            if (OakItemRunner.isActive("Shiny Charm")) {
                egg.shinySteps += amount;
            }
            if (egg.steps() >= egg.totalSteps) {
                if (egg.type == GameConstants.EggType.Pokemon) {
                    $.notify(egg.pokemon + " is ready to hatch!");
                } else {
                    $.notify("An egg is ready to hatch!")
                }
                egg.notified = true;
            }
        }
    }

    public static gainPokemonEgg(pokemon: CaughtPokemon) {
        if (!player.hasFreeEggSlot()) {
            $.notify("You don't have any free egg slots");
            return;
        }
        let egg = this.createEgg(pokemon.name);
        pokemon.breeding(true);
        player.gainEgg(egg);

        $('#breedingModal').modal('hide');

    }

    public static hatchPokemonEgg(index: number) {
        let egg = player._eggList[index]();
        let shiny = PokemonFactory.generateShiny(GameConstants.SHINY_CHANCE_BREEDING);

        for (let i=0; i<player._caughtPokemonList().length; i++) {
            if (player._caughtPokemonList()[i].name == egg.pokemon) {
                if (player._caughtPokemonList()[i].breeding) {
                    player._caughtPokemonList()[i].exp(0);
                    player._caughtPokemonList()[i].breeding(false);
                }
            }
        }
        player.capturePokemon(egg.pokemon, shiny);
        player._eggList[index](null);
    }

    public static createEgg(pokemonName: string, type = GameConstants.EggType.Pokemon): Egg {
        let dataPokemon: DataPokemon = PokemonHelper.getPokemonByName(pokemonName);
        return new Egg(this.getSteps(dataPokemon.eggCycles), pokemonName, type);
    }

    public static createTypedEgg(type: GameConstants.EggType): Egg {
        let name = HatchList[type][Math.floor(Math.random() * HatchList[type].length)];
        return BreedingHelper.createEgg(name, type);
    }

    public static createRandomEgg(): Egg {
        let type = Math.floor(Math.random() * (Object.keys(HatchList).length - 1));
        let egg = BreedingHelper.createTypedEgg(type);
        egg.type = GameConstants.EggType.Mystery;
        return egg;
    }

    public static getSteps = function (eggCycles: number) {
        if (eggCycles === undefined) {
            return 500;
        } else {
            return eggCycles * 40;
        }
    }

    public static getEggImage(egg: Egg): string {
        let eggType = GameConstants.EggType[egg.type].toLowerCase();
        if (eggType == "pokemon") {
            let dataPokemon: DataPokemon = PokemonHelper.getPokemonByName(egg.pokemon);
            eggType = String(dataPokemon.type1).toLowerCase();
        }
        return "assets/images/breeding/egg" + eggType + ".png";
    }
}

const HatchList: { [name: number]: string[] } = {};
HatchList[GameConstants.EggType.Fire] = ["Charmander", "Vulpix", "Growlithe", "Ponyta"];
HatchList[GameConstants.EggType.Water] = ["Squirtle", "Lapras", "Staryu", "Psyduck"];
HatchList[GameConstants.EggType.Grass] = ["Bulbasaur", "Oddish", "Tangela", "Bellsprout"];
HatchList[GameConstants.EggType.Fight] = ["Hitmonlee", "Hitmonchan", "Machop", "Mankey"];
HatchList[GameConstants.EggType.Electric] = ["Magnemite", "Pikachu", "Voltorb", "Electabuzz"];
HatchList[GameConstants.EggType.Dragon] = ["Dratini", "Dragonair", "Dragonite"];

document.addEventListener("DOMContentLoaded", function (event) {

    $('#breedingModal').on('hide.bs.modal', function () {
        Game.gameState(GameConstants.GameState.fighting);
    });

});