document.addEventListener('DOMContentLoaded', () => {
    const pokemonGallery = document.getElementById('pokemon-gallery');
    const searchInput = document.getElementById('search');
    const filterMoveInput = document.getElementById('filter-move');
    const filterTypeInput = document.getElementById('filter-type');
    const pokemonForm = document.getElementById('pokemonForm');
    const pokemonFormModal = new bootstrap.Modal(document.getElementById('pokemonFormModal'), {});
    let pokemonList = [];
    let editingPokemon = null;

    fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=151')
        .then(response => response.json())
        .then(data => {
            const fetches = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            return Promise.all(fetches);
        })
        .then(pokemons => {
            pokemonList = pokemons;
            displayPokemon(pokemonList);
        });

    function displayPokemon(pokemons) {
        pokemonGallery.innerHTML = '';
        pokemons.forEach(pokemon => {
            const pokemonCard = document.createElement('div');
            pokemonCard.className = 'col-md-4 pokemon-card';
            pokemonCard.innerHTML = `
                <div class="card">
                    <img src="${pokemon.sprites.front_default}" class="card-img-top pokemon-image" alt="${pokemon.name}">
                    <div class="card-body">
                        <h5 class="card-title">${pokemon.name}</h5>
                        <p class="card-text">#${pokemon.id}</p>
                        <a href="recursos/paginas/details.html?id=${pokemon.id}" class="btn btn-primary">Ver más</a>
                        <button class="btn btn-secondary" onclick="openEditPokemonForm(${pokemon.id})">Editar</button>
                        <button class="btn btn-danger" onclick="confirmDeletePokemon(${pokemon.id})">Eliminar</button>
                    </div>
                </div>
            `;
            pokemonGallery.appendChild(pokemonCard);
        });
    }

    searchInput.addEventListener('input', () => {
        filterAndDisplayPokemon();
    });

    filterMoveInput.addEventListener('input', () => {
        filterAndDisplayPokemon();
    });

    filterTypeInput.addEventListener('input', () => {
        filterAndDisplayPokemon();
    });

    function filterAndDisplayPokemon() {
        const searchValue = searchInput.value.toLowerCase();
        const moveValue = filterMoveInput.value.toLowerCase();
        const typeValue = filterTypeInput.value.toLowerCase();

        const filteredPokemons = pokemonList.filter(pokemon => {
            const matchesName = pokemon.name.toLowerCase().includes(searchValue);
            const matchesMove = moveValue ? pokemon.moves.some(move => move.move.name.toLowerCase().includes(moveValue)) : true;
            const matchesType = typeValue ? pokemon.types.some(type => type.type.name.toLowerCase().includes(typeValue)) : true;
            return matchesName && matchesMove && matchesType;
        });

        displayPokemon(filteredPokemons);
    }

    window.sortAZ = () => {
        const sortedPokemons = [...pokemonList].sort((a, b) => a.name.localeCompare(b.name));
        displayPokemon(sortedPokemons);
    };

    window.sortZA = () => {
        const sortedPokemons = [...pokemonList].sort((a, b) => b.name.localeCompare(a.name));
        displayPokemon(sortedPokemons);
    };

    window.sortById = () => {
        const sortedPokemons = [...pokemonList].sort((a, b) => a.id - b.id);
        displayPokemon(sortedPokemons);
    };

    window.sortByIdDesc = () => {
        const sortedPokemons = [...pokemonList].sort((a, b) => b.id - a.id);
        displayPokemon(sortedPokemons);
    };

    window.openAddPokemonForm = () => {
        editingPokemon = null;
        pokemonForm.reset();
        document.getElementById('pokemonFormTitle').textContent = 'Agregar Pokémon';
        populateFormSelects();
        pokemonFormModal.show();
    };

    window.openEditPokemonForm = (id) => {
        editingPokemon = pokemonList.find(pokemon => pokemon.id === id);
        document.getElementById('pokemonFormTitle').textContent = 'Editar Pokémon';
        populateFormSelects(editingPokemon);
        pokemonFormModal.show();
    };

    function populateFormSelects(pokemon = null) {
        const typesSelect = document.getElementById('pokemon-types');
        const movesSelect = document.getElementById('pokemon-moves');

        typesSelect.innerHTML = '';
        movesSelect.innerHTML = '';

        Promise.all([
            fetch('https://pokeapi.co/api/v2/type').then(res => res.json()),
            fetch('https://pokeapi.co/api/v2/move').then(res => res.json())
        ]).then(([typesData, movesData]) => {
            typesData.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name;
                if (pokemon && pokemon.types.some(pokemonType => pokemonType.type.name === type.name)) {
                    option.selected = true;
                }
                typesSelect.appendChild(option);
            });

            movesData.results.slice(0, 50).forEach(move => {
                const option = document.createElement('option');
                option.value = move.name;
                option.textContent = move.name;
                if (pokemon && pokemon.moves.some(pokemonMove => pokemonMove.move.name === move.name)) {
                    option.selected = true;
                }
                movesSelect.appendChild(option);
            });
        });

        if (pokemon) {
            document.getElementById('pokemon-name').value = pokemon.name;
            document.getElementById('pokemon-id').value = pokemon.id;
            document.getElementById('pokemon-image').value = pokemon.sprites.front_default;
        }
    }

    pokemonForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('pokemon-name').value;
        const id = parseInt(document.getElementById('pokemon-id').value);
        const imageUrl = document.getElementById('pokemon-image').value;
        const types = Array.from(document.getElementById('pokemon-types').selectedOptions).map(option => ({ type: { name: option.value } }));
        const moves = Array.from(document.getElementById('pokemon-moves').selectedOptions).map(option => ({ move: { name: option.value } }));

        const newPokemon = { name, id, sprites: { front_default: imageUrl }, types, moves };

        if (editingPokemon) {
            const index = pokemonList.findIndex(pokemon => pokemon.id === editingPokemon.id);
            pokemonList[index] = newPokemon;
        } else {
            pokemonList.push(newPokemon);
        }

        displayPokemon(pokemonList);
        pokemonFormModal.hide();
    });

    window.confirmDeletePokemon = (id) => {
        const confirmed = confirm('¿Estás seguro de que deseas eliminar este Pokémon?');
        if (confirmed) {
            deletePokemon(id);
        }
    };

    function deletePokemon(id) {
        pokemonList = pokemonList.filter(pokemon => pokemon.id !== id);
        displayPokemon(pokemonList);
    }
});