/************************************  common  ***************************************************/



/*************************  comparing passwords in signup form  **********************************/

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


/******************  notify seller that a somebody is interested in his/her product ***************/

let notifySeller = async btn => {
    const product_id = btn.parentNode.querySelector('[name = product_id]').value;
    const rollNo = btn.parentNode.querySelector('[name = rollNo]').value;
    const csrf = btn.parentNode.querySelector('[name = _csrf]').value;
    try {
        const result = await fetch('/' + rollNo + '/product/' + product_id + '/notify-seller', {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        });
        const data = await result.json();
        btn.parentNode.querySelector('[name = notify_message]').innerHTML = data.message;
    } catch (err) {
        console.log(err);
    }
};

/**************************************  delete a product ******************************************/

let deleteProduct = async btn => {
    const product_id = btn.parentNode.querySelector('[name = product_id]').value;
    const rollNo = btn.parentNode.querySelector('[name = rollNo]').value;
    const imagePublicId = btn.parentNode.querySelector('[name = imagePublicId]').value;
    const csrf = btn.parentNode.querySelector('[name = _csrf]').value;
    try {
        const result = await fetch('/' + rollNo + '/product/' + product_id + '/delete/' + imagePublicId.split('/')[1], {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        });
        const data = await result.json();
        btn.parentNode.parentNode.parentNode.parentNode.removeChild(btn.parentNode.parentNode.parentNode);
    } catch (err) {
        console.log(err);
    }
};

