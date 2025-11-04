document.addEventListener('DOMContentLoaded', () => {

    const registroForm = document.querySelector('.formulario');

    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // campos del formulario
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const fechaNacimiento = document.getElementById('fecha').value;
        const tipoCedula = document.getElementById('tipoCedula').value;
        const documento = document.getElementById('documento').value;
        const telefono = document.getElementById('telefono').value;
        const plan = document.getElementById('plan').value;
        const sede = document.getElementById('sede').value;
        const email = document.getElementById('email').value;
        const contraseña = document.getElementById('contraseña').value;

        // objeto para almacenar los datos del usuario
        const usuarioData = {
            nombre,
            apellido,
            fechaNacimiento,
            tipoCedula,
            documento,
            telefono,
            plan,
            sede,
            email,
            contraseña
        };

        // Guardar el objeto de datos en localStorage
        localStorage.setItem('usuarioRegistrado', JSON.stringify(usuarioData));

        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        // Redirige al login.html
        window.location.href = '../HTML/login.html';
    });

});