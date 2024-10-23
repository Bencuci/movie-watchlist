const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
const main = document.querySelector("main")
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
const loadingMessage = document.getElementById("loading")

// Variables for adding next page when its scrolled to the bottom
const throttledBottomed = throttle(addPage, 3000)
let pageNumber = 1

if(searchBtn) {
    searchBtn.addEventListener("click", async (e) => {
        e.preventDefault()
        main.innerHTML = ``
        pageNumber = 1
        handleSearch(pageNumber)
    })
}

// Check the current page and load the watchlist if needed
let currentPage = window.location.href;
if(currentPage.includes("watchlist.html")) {
    if(watchlist && watchlist.length >= 1) {
        main.textContent = ""
        main.style.paddingTop = "0.8em";
        main.style.justifyContent = "start"
        loadContent(watchlist)
    } else {
        console.log("No movies found in the watchlist");
    }
}

// Takes the result of search according to the current page
async function handleSearch(page) {
    loadingMessage.style.display = "block"
    if(searchInput && searchInput.value) {
        const response = await fetch(`https://www.omdbapi.com/?apikey=e021ea65&type=movie&s=${searchInput.value}&page=${page}`)
        const movies = await response.json()
        
        // Adding Plot, imdbRating, Runtime and Genre attributes to the movies of the page. By default, API do not give their plot properties. Only when fetching with single movie search with parameter of "t", instead of "s"
        if(movies.Search) {
            for(let movie of movies.Search) {
                const response = await fetch(`https://www.omdbapi.com/?apikey=e021ea65&type=movie&t=${movie.Title}&i=${movie.imdbID}`)
                const movieFound = await response.json()
                movie.Plot = movieFound.Plot
                movie.imdbRating = movieFound.imdbRating
                movie.Runtime = movieFound.Runtime
                movie.Genre = movieFound.Genre
            }
            loadingMessage.style.display = "none"
            loadContent(movies.Search)
        }
    }
    loadingMessage.style.display = "none"
}

function loadContent(movies) {
    for(let movie of movies) {
        if (!movie.Poster || movie.Poster === "N/A") {
            continue
        }
        
        const movieContainer = document.createElement("div")
        movieContainer.className = "movie-container"
        
            const poster = document.createElement("img")
            poster.src = movie.Poster
            poster.className = "poster"
            
            const article = document.createElement("article")
            
                const titleContainer = document.createElement("div")
                titleContainer.className = "title-container"
            
                    const title = document.createElement("h2")
                    title.textContent = movie.Title
                    
                    const starIcon = document.createElement("img")
                    starIcon.src = "/images/starIcon.png"
                    starIcon.className = "star-icon"
                    
                    const imdbRating = document.createElement("span")
                    imdbRating.textContent = movie.imdbRating
                
                const watchlistContainer = document.createElement("div")
                watchlistContainer.className = "watchlist-container"
                    
                    const runtime = document.createElement("span")
                    runtime.textContent = movie.Runtime
                    
                    const genre = document.createElement("span")
                    genre.textContent = movie.Genre
                    
                    let watchlistBtn, btnLabel
                    const exists = watchlist.some( obj => obj.imdbID === movie.imdbID )
                    if(exists) {
                        watchlistBtn = document.createElement("button")
                        watchlistBtn.textContent = "-"
                        watchlistBtn.className = "watchlist-btn remove"
                        watchlistBtn.id = movie.imdbID
                        
                        btnLabel = document.createElement("label")
                        btnLabel.setAttribute("for", watchlistBtn.id)
                        btnLabel.textContent = "Remove"
                    } else {
                        watchlistBtn = document.createElement("button")
                        watchlistBtn.textContent = "+"
                        watchlistBtn.className = "watchlist-btn add"
                        watchlistBtn.id = movie.imdbID
                        
                        btnLabel = document.createElement("label")
                        btnLabel.setAttribute("for", watchlistBtn.id)
                        btnLabel.textContent = "Watchlist"
                    }
                
                
                const plot = document.createElement("p")
                plot.textContent = movie.Plot
            
            const hr = document.createElement("hr")
        
        titleContainer.appendChild(title)
        titleContainer.appendChild(starIcon)
        titleContainer.appendChild(imdbRating)
        
        watchlistContainer.appendChild(runtime)
        watchlistContainer.appendChild(genre)
        watchlistContainer.appendChild(watchlistBtn)
        watchlistContainer.appendChild(btnLabel)
        
        article.appendChild(titleContainer)
        article.appendChild(watchlistContainer)
        article.appendChild(plot)
        
        movieContainer.appendChild(poster)
        movieContainer.appendChild(article)
        
        main.appendChild(movieContainer)
        main.appendChild(hr)
    }
    
    const watchlistBtns = document.querySelectorAll(".watchlist-btn")
    if(watchlistBtns) {
        watchlistBtns.forEach((btn) => {
            btn.addEventListener("click", async () => {
                if(btn.classList.contains("add")) {
                    const response = await fetch(`https://www.omdbapi.com/?apikey=ccd28c4a&type=movie&i=${btn.id}`)
                    const movieFound = await response.json()
                    watchlist.push(movieFound)
                    localStorage.setItem("watchlist", JSON.stringify(watchlist))
                    
                    btn.className = "watchlist-btn remove"
                    btn.textContent = "-"
                    const btnLabel = document.querySelector(`label[for="${btn.id}"]`)
                    btnLabel.textContent = "Remove"
                } else if(btn.classList.contains("remove")) {
                    watchlist = watchlist.filter(movie => movie.imdbID !== btn.id)
                    localStorage.setItem("watchlist", JSON.stringify(watchlist))
                    
                    btn.className = "watchlist-btn add"
                    btn.textContent = "+"
                    const btnLabel = document.querySelector(`label[for="${btn.id}"]`)
                    btnLabel.textContent = "Watchlist"
                }
            })
        })
    }
}

// When scrolling hits bottom, next page loads in
window.addEventListener("scroll", function() {
    const scrollableHeight = document.documentElement.scrollHeight
    const scrollPosition = window.innerHeight + window.scrollY
    
    if(scrollPosition >= scrollableHeight - 350) {
        throttledBottomed()
    }
})

function addPage() {
    pageNumber++
    handleSearch(pageNumber)
}

function throttle(func, delay) {
    let throttleTimeout = null
    return ()=> {
       if(!throttleTimeout) {
           func()
           throttleTimeout = setTimeout(()=> {
               throttleTimeout = null
           }, delay)
       } 
    }
}