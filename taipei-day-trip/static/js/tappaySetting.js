TPDirect.setupSDK(137084, 'app_uJTM8MBM3qcQUR6EP5SkarNN2K6rO5nalFHAYesrg5h1KAdGBzwngVFFSLU6', 'sandbox')
TPDirect.card.setup({
    fields: {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv'
        }
    },
    styles: {
        'input': {
            'color': 'gray'
        },
        'input.ccv': {
            // 'font-size': '16px'
        },
        ':focus': {
            'color': 'orange'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    }
})


function onSubmit(event) {
    event.preventDefault()

    let contactName=document.getElementById('contactName').value
    let contactMail=document.getElementById('contactMail').value
    let contactPhone=document.getElementById('contactPhone').value

    if (!contactName || !contactMail ||!contactPhone) {
        alert('請填寫聯絡人姓名、聯絡人郵箱與連絡電話');
        return;
    }

    let tappayStatus = TPDirect.card.getTappayFieldsStatus()
      // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('交易失敗')
        return
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('交易失敗' + result.msg)
            return
        }
        let data={
            "prime":result.card.prime,
            "order":{
                "price":bookingData['price'],
                "trip":{
                    "attraction":bookingData['attraction'],
                    "date":bookingData['date'],
                    "time": bookingData['time']
                },"contact": {
                    "name": contactName,
                    "email": contactMail,
                    "phone": contactPhone
                }
            }
        }
        alert('正在進行交易')

        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },body: JSON.stringify(data)
            }).then(response => {
            if (response.ok) {
                return response.json();
                
            }
        }).then(data => {
        
            const redirectURL = `/thankyou?number=${data['data']['number']}`;
            window.location.href = redirectURL;
        })
    })
}
