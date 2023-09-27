let jwtToken = localStorage.getItem("token");
let totalCost=0;

fetch('/api/booking', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
    }
})
.then(response => {
    if (response.ok) {
        return response.json(); 
    } else {
        throw new Error('網路請求失敗');
    }
})
.then(data => {
    let jwtToken = localStorage.getItem("token");

    if (jwtToken !== null && jwtToken !== undefined){
        let noSchedule=document.querySelector(".noSchedule");
        let schedule = document.querySelector(".schedule");
        let otherInformation=document.querySelector(".otherInformation");
        let footer=document.querySelector(".footer")

        if (data['data']== null){
            
            noSchedule.style.display = "block";
            schedule.style.display = "none";
            otherInformation.style.display = "none";
            footer.style.height = "calc(100vh - 290px)";
        }
        else{
            noSchedule.style.display = "none";
            schedule.style.display = "block";
            otherInformation.style.display = "block";
            footer.style.height = "14px";

            let attractionImg=document.querySelector(".schedule__information__img")
            attractionImg.src =data['data']['attraction']['image'];

            let attractionTitle=document.querySelector(".schedule__information__detail__title")
            attractionTitle.textContent=data['data']['attraction']['name'];

            let bookingDate=document.getElementById("bookingDate")
            bookingDate.textContent="日期：" + data['data']['date'];
            
            let bookingTime=document.getElementById("bookingTime")
            if (data['data']['time']=="morning"){
                bookingTime.textContent="時間：早上9點到中午12點";
            }
            else if (data['data']['time']=="afternoon"){
                bookingTime.textContent="時間：中午12點到下午4點";
            }
            let cost=document.getElementById("cost")
            cost.textContent="費用：新台幣" + data['data']['price']+"元";
            
            totalCost+=data['data']['price'];
            let paymentTotalCost=document.querySelector(".payment__totalCost")
            paymentTotalCost.textContent="總價：新台幣" + totalCost+"元";

            let address=document.getElementById("address")
            address.textContent="地點：" + data['data']['attraction']['address'];
        }
    }
    else{
        window.location.href = '/';
    }
})
.catch(error => {
    console.error('發生錯誤:', error);
});

document.querySelector(".deleteIcon").addEventListener("click",  function() {
    fetch('/api/booking', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    })
    .then(response => {
        if (response.ok) {
            window.location.reload();
        }
    })
})
