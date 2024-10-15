document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.getElementById('films');
    const movieDetails = document.getElementById('movie-details');

    // Fetch all films and populate the list
    fetchFilms();

    function fetchFilms() {
        fetch("http://localhost:3000/films")
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(films => {
                films.forEach(film => {
                    const li = document.createElement('li');
                    li.classList.add('film', 'item');
                    li.textContent = film.title;
                    li.dataset.id = film.id; // Store film id for later use

                    // Create delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-button');
                    deleteButton.onclick = () => deleteFilm(film.id); // Bind delete function

                    li.appendChild(deleteButton); // Append delete button to list item
                    li.addEventListener('click', () => fetchFilmDetails(film.id));
                    filmsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching films:', error));
    }

    function fetchFilmDetails(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(film => {
                displayMovieDetails(film);
            })
            .catch(error => console.error('Error fetching film details:', error));
    }

    function displayMovieDetails(film) {
        document.getElementById('title').textContent = film.title;
        document.getElementById('runtime').textContent = `${film.runtime} minutes;`;
        document.getElementById('film-info').textContent = film.description;
        document.getElementById('showtime').textContent = film.showtime;
        document.getElementById('ticket-num').textContent = film.capacity - film.tickets_sold;
        document.getElementById('poster').src = film.poster;
        document.getElementById('poster').alt = `${film.title} poster`;

        const buyButton = document.getElementById('buy-ticket');
        buyButton.disabled = film.tickets_sold >= film.capacity;
        buyButton.textContent = film.tickets_sold >= film.capacity ? 'Sold Out' : 'Buy Ticket';

        buyButton.onclick = () => buyTicket(film);
    }

    function buyTicket(film) {
        if (film.tickets_sold < film.capacity) {
            const updatedTicketsSold = film.tickets_sold + 1;

            // Update the film on the server
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tickets_sold: updatedTicketsSold })
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(updatedFilm => {
                displayMovieDetails(updatedFilm);
                return fetch("http://localhost:3000/tickets", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ film_id: updatedFilm.id, number_of_tickets: 1 })
                });
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(ticket => {
                console.log('Ticket purchased:', ticket);
            })
            .catch(error => console.error('Error buying ticket:', error));
        }
    }

    function deleteFilm(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            const filmItem = [...filmsList.children].find(li => li.dataset.id === filmId.toString());
            if (filmItem) {
                filmsList.removeChild(filmItem);
            }
            // Clear the movie details
            movieDetails.innerHTML = '';
        })
        .catch(error => console.error('Error deleting film:', error));
    }
});
