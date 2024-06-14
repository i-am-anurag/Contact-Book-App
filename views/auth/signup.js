$(document).ready(function() {
    $('#form').submit(function(event) {
        event.preventDefault();

        const name = $('#username').val();
        const email = $('#email').val();
        const password = $('#password').val();

        const user = {
            name: name,
            email: email,
            password: password
        };

        console.log(user);

        $.ajax({
            type: 'POST',
            url: '/api/user/signup', // Replace with your backend endpoint
            data: JSON.stringify(user),
            contentType: 'application/json',
            success: function(response) {
                console.log('Signup successful!');
                // Handle successful signup (redirect, show success message, etc.)
            },
            error: function(xhr, status, error) {
                const errorMessage = JSON.parse(xhr.responseText).message;
                $('#signupError').text(errorMessage);
                $('#signupError').show();
                // Handle error response (show error message, etc.)
            }
        });
    });
});
