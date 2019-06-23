const comparePasswords = () => {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;
    let message = document.getElementById('passwordComparisonMessage');
    if (password !== confirmPassword) {
        message.innerHTML = 'Passwords Not Matched!';
        message.style.color = 'red';
    } else {
        if (password === '') {
            message.innerHTML = '';
        } else if (password.length < 8) {
            message.innerHTML = 'Password Too Small!';
            message.style.color = 'red';
        } else {
            message.innerHTML = 'Passwords Matched!';
            message.style.color = 'white';
        }
    }
};