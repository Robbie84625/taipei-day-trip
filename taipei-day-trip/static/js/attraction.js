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

        let defaultImg = document.querySelector(".loadGIF");
        attractionImg.onload = () => {
            defaultImg.style.display = "none";
        };

        
        let bannerItem = document.createElement("div");
        bannerItem.className = "attractionsHub__imgDiv__banner__item";
        let bannerItemIcon = document.createElement("div");
        bannerItemIcon.className = "attractionsHub__imgDiv__banner__item__icon";
        bannerItemIcon.id="icon"+i;

        if(index==i){
            bannerItemIcon.style.background='#000000';
        }
        else{
            attractionImg.style.opacity = 0;
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

    newImgIndex.style.transition = "opacity 1s ease-in-out"; 
    
    newImgIndex.style.opacity = 1;


    oldImgIndex.style.opacity = 0;
    newImgIndex.style.zIndex = 2;


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


    newImgIndex.style.transition = "opacity 1s ease-in-out"; 
    
    newImgIndex.style.opacity = 1;

    oldImgIndex.style.opacity = 0;

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

let login=document.getElementById("login")
let dialogMask=document.querySelector(".dialogMask")

document.getElementById('auth').addEventListener("click", function() {
    login.open = true;
    dialogMask.style.display = 'block';
})

document.getElementById("closeLogin").addEventListener("click", function() {
    dialogMask.style.display = 'none';

    let emailId = document.getElementById("signInEmail");
    let passwordId =  document.getElementById("signInPassword");
    emailId.value = "";
    passwordId.value = "";

    let loginMessage=document.getElementById("loginMessage")
    loginMessage.style.display = 'none';

    login.close();
})

document.getElementById("signInButton").addEventListener("click", function() {
    let email = document.getElementById("signInEmail").value;
    let password = document.getElementById("signInPassword").value;

    let data = {
        email: email,
        password: password
    };

    fetch('/api/user/auth', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            window.location.reload();
            return response.json().then(data => {
                let jwtToken = data.token;
                localStorage.setItem("token", jwtToken);
            });
        } 
        else{
            return response.json().then(errorData => {
                let emailId = document.getElementById("signInEmail");
                let passwordId =  document.getElementById("signInPassword");
                
                let errorMessage="";
                if( emailId.value == "" || passwordId.value == ""){
                    errorMessage = "請填寫帳號或密碼";

                }
                else{
                    errorMessage = errorData.message;
                }
                let loginMessage=document.getElementById("loginMessage") 

                loginMessage.textContent = errorMessage; 
                loginMessage.style.display='block';

                emailId.value = "";
                passwordId.value = "";

                let loginMain = document.getElementById('loginMain');
                loginMain.addEventListener('click', function() {
                        loginMessage.style.display='none';
                });
                
            });
        }
    })
});


document.addEventListener('DOMContentLoaded', function() {
    let jwtToken = localStorage.getItem("token");
    fetch('/api/user/auth', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`
        }
    }).then(response => {
        if (response.ok) {
            signOut.style.display='block';
            auth.style.display='none';
        }
        else{
            return response.json().then(errorData => {
                signOut.style.display='none';
                auth.style.display='block';
            })
        }
    })
});

let toSignUp=document.getElementById("toSignUp")
let signUp=document.getElementById("signUp")

toSignUp.addEventListener("click",  function() {
    login.close();
    signUp.open = true;
});

document.getElementById("closeSignUp").addEventListener("click", function() {
    dialogMask.style.display = 'none';
    
    let nameId = document.getElementById("signUpName");
    let emailId = document.getElementById("signUpEmail");
    let passwordId =  document.getElementById("signUpPassword");

    nameId.value="";
    emailId.value = "";
    passwordId.value = "";

    let signUpMessage=document.getElementById("signUpMessage")
    signUpMessage.style.display = 'none';

    signUp.close();
})

document.getElementById("signUpButton").addEventListener("click", function() {
    let namePattern = /^[a-zA-Z\u4e00-\u9fa5\s]+$/;
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
    let signUpMessage=document.getElementById("signUpMessage") 

    let nameId = document.getElementById("signUpName")
    let emailId = document.getElementById("signUpEmail");
    let passwordId =  document.getElementById("signUpPassword");
    let errorMessage = "";

    let data = {
        name:nameId.value,
        email: emailId.value,
        password: passwordId.value
    };

    if (nameId.value == "" || emailId.value == "" || passwordId.value == ""){
        errorMessage = "請輸入完整資訊";

        signUpMessage.style.display = 'block';
        signUpMessage.textContent = errorMessage;
        
        nameId.value="";
        emailId.value = "";
        passwordId.value = "";
    }
    else if(!emailPattern.test(emailId.value) || !namePattern.test(nameId.value)){
        errorMessage = "姓名或email格式不正確"; 

        signUpMessage.style.display = 'block';
        signUpMessage.textContent = errorMessage;

        nameId.value="";
        emailId.value = "";
        passwordId.value = "";
    }
    else{
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                        signUpMessage.textContent = "註冊成功，請登入系統";
                        signUpMessage.style.color = "#00FF00"
                        signUpMessage.style.display='block';
                        
                        nameId.value="";
                        emailId.value = "";
                        passwordId.value = "";
                    }
                else{
                    return response.json().then(errorData => {
                        
                        errorMessage = errorData.message;

                        signUpMessage.textContent = errorMessage;
                        signUpMessage.style.color = "#ff0000"; 
                        signUpMessage.style.display='block';


                        nameId.value="";
                        emailId.value = "";
                        passwordId.value = "";
                    })
                }
        })
    }

    let signUpMain = document.getElementById('signUpMain');
    signUpMain.addEventListener('click', function(event) {
        if (event.target.id !== "signUpButton") {
            signUpMessage.style.display='none';
        }
    });
    
})
let toSignIn = document.getElementById("toSignIn")


toSignIn.addEventListener("click",  function() {
    signUp.close();
    login.open = true;

    let signUpMessage=document.getElementById("signUpMessage") 
    signUpMessage.style.display = 'none';
});

let signOut = document.getElementById('signOut');
let auth = document.getElementById('auth');
signOut.addEventListener("click",  function() {
    localStorage.removeItem("token");
    window.location.reload();
});