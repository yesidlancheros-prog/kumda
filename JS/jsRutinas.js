const rutinas = {
    "Masa": [
        "Press de banca x 3 series",
        "Sentadillas con peso x 3 series",
        "Remo con barra x 3 series",
        "Curl de bíceps x 3 series"
    ],
    "Peso": [
        "Cardio HIIT x 20 min",
        "Burpees x 3 series",
        "Mountain climbers x 3 series",
        "Jumping jacks x 3 series"
    ],
    "Tonificar": [
        "Plancha x 1 min",
        "Sentadillas sin peso x 3 series",
        "Flexiones x 3 series",
        "Abdominales x 3 series"
    ],
    "Funcional": [
        "Circuito funcional x 20 min",
        "Ejercicios con peso corporal",
        "Saltos laterales x 3 series",
        "Escaladores x 3 series"
    ]
};

document.querySelectorAll("button").forEach(boton => {
    boton.addEventListener("click", () => {
        const rutina = boton.dataset.rutina;
        const detalles = document.getElementById("rutina-detalles");

        detalles.innerHTML = `
            <h1>Rutina: ${rutina}</h1>
            <ul>
                ${rutinas[rutina].map(paso => `<li>${paso}</li>`).join("")}
            </ul>
        `;

        detalles.scrollIntoView({ behavior: "smooth" });
    });
});