async function loadData() {
    try {
        
        let currentURL = window.location.pathname;
        let parts = currentURL.split('/');
        let attractionId = parts.pop();

        const response = await fetch(`/api/attraction/${attractionId}`);
        const data = await response.json();
        return data['data'];
    } catch (error) {
        console.error("Error loading attraction image:", error);
        return null;
    }
}

let index=0;
let attractionImg = document.querySelector(".attractionsHub__imgDiv");
let imgListLen;

async function main(){

    let data = await  loadData();
    
    imgListLen=data['images'].length;
    for (let i=0;i<imgListLen;i++){
        let attractionImg = document.createElement("img");
        attractionImg.className= "attractionsHub__imgDiv__img";
        attractionImg.src = data['images'][i];
        attractionImg.id="attraction"+i;

        let bannerItem = document.createElement("div");
        bannerItem.className = "attractionsHub__imgDiv__banner__item";
        let bannerItemIcon = document.createElement("div");
        bannerItemIcon.className = "attractionsHub__imgDiv__banner__item__icon";
        bannerItemIcon.id="icon"+i;
        if(index==i){
            bannerItemIcon.style.background='#000000';
            attractionImg.hidden = false;
        }
        else{
            attractionImg.hidden = true;
        }
        
        bannerItem.appendChild(bannerItemIcon);
        let banner = document.querySelector(".attractionsHub__imgDiv__banner");
        banner.appendChild(bannerItem);
        let attractionImgDiv = document.querySelector(".attractionsHub__imgDiv");
        attractionImgDiv.appendChild(attractionImg);
    }
    
    let attractionTittle=document.querySelector(".attractionsHub__bookingDiv__attractionTittle");
    attractionTittle.textContent=data["name"]
    
    let mrtAndCategory=document.querySelector(".attractionsHub__bookingDiv__mrtAndCategory");
    mrtAndCategory.textContent=data["category"]+" at " +data["mrt"];

    let description =document.querySelector(".attractionInformation__description");
    let adress =document.querySelector(".attractionInformation__address");
    let transport =document.querySelector(".attractionInformation__description__content");
    
    description.textContent= data["description"];
    adress.textContent=data["address"];
    transport.textContent=data["transport"];
}

let leftIcon= document.getElementById('leftIcon');
leftIcon.addEventListener("click", async function () {
    let oldImgIndex = document.getElementById("attraction"+index);
    let oldIcon=document.getElementById("icon"+index);
    index--;
    if (index<0){
        index=imgListLen-1
    }
    let newImgIndex = document.getElementById("attraction"+index);
    let newIcon=document.getElementById("icon"+index);

    oldImgIndex.hidden=true;
    newImgIndex.hidden=false;
    
    oldIcon.style.background='#FFFFFF';
    newIcon.style.background='#000000';
});

let rightIcon=document.getElementById('rightIcon');
rightIcon.addEventListener("click", async function () {
    let oldImgIndex = document.getElementById("attraction"+index);
    let oldIcon=document.getElementById("icon"+index);
    index++;

    if (index>imgListLen-1){
        index=0;
    }

    let newImgIndex = document.getElementById("attraction"+index);
    let newIcon=document.getElementById("icon"+index);

    oldImgIndex.hidden=true;
    newImgIndex.hidden=false;

    oldIcon.style.background='#FFFFFF';
    newIcon.style.background='#000000';
});



let btn1 =document.querySelector(".btnDiv__btn1")
let btn2 =document.querySelector(".btnDiv__btn2")
let costText =document.querySelector(".attractionsHub__bookingDiv__cost__dollar")
btn1.addEventListener("click", function() {
    btn1.style.backgroundColor = "#448899";
    btn2.style.backgroundColor = "#FFFFFF";
    costText.textContent="新台幣 2000 元"
});

btn2.addEventListener("click", function() {
    btn2.style.backgroundColor = "#448899";
    btn1.style.backgroundColor = "#FFFFFF";
    costText.textContent="新台幣 2500 元"
});

let home =document.querySelector(".header__title")
home.addEventListener("click", function() {
    window.location.href = '/';
});

main();

