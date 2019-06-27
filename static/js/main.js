const comparePasswords = () => {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;
    let message = document.getElementById('passwordComparisonMessage');
    let submitBtn = document.getElementById('submitBtn');
    if (password !== confirmPassword) {
        message.innerHTML = 'Passwords Not Matched!';
        message.style.color = 'red';
        submitBtn.disabled = true;
    } else {
        if (password === '') {
            message.innerHTML = '';
            submitBtn.disabled = true;
        } else if (password.length < 8) {
            message.innerHTML = 'Password Too Small!';
            message.style.color = 'red';
            submitBtn.disabled = true;
        } else {
            message.innerHTML = 'Passwords Matched!';
            message.style.color = 'white';
            submitBtn.disabled = false;
        }
    }
};

let notifySeller = btn => {
    const product_id = btn.parentNode.querySelector('[name = product_id]').value;
    const rollNo = btn.parentNode.querySelector('[name = rollNo]').value;
    fetch('/' + rollNo + '/product/' + product_id + '/notify-seller', {
        method: 'DELETE'
    })
        .then(result => {
            return result.json();
        })
        .then(data => {
            btn.parentNode.querySelector('[name = notify_message]').innerHTML = data.message;
        })
        .catch(err => {
            console.log(err);
        });
}