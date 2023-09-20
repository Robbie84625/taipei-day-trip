let page = 0;
let isLoading = false;

function loadNextPage() {
    
    isLoading = true;
    let keyword = searchInput.value;
    
    fetch(`/api/attractions?page=${page}&keyword=${keyword}`).then(function(response) {
    return response.json();
    }).then(function(data) {
        for (let detail of data['data']){
        
            let attractionItemDiv = document.createElement("div");
            attractionItemDiv.className = "attraction__item";

            let attractionItemDetailDiv = document.createElement("div");
            attractionItemDetailDiv.className = "attraction__item__detail";

            let attractionItemDetailTextDiv = document.createElement("div");
            attractionItemDetailTextDiv.className = "attraction__item__detail__text";

            let imageUrl = decodeURIComponent(detail['images'][0]);
            attractionItemDetailDiv.style.background = `url(${imageUrl}) no-repeat center center / cover`;

            let image = new Image();
            image.src=imageUrl

            image.onload = function() {
                attractionItemDiv.style.background = "none";
            };

            attractionItemDetailTextDiv.textContent = detail['name'];
            attractionItemDetailDiv.appendChild(attractionItemDetailTextDiv);
            
            attractionItemDiv.appendChild(attractionItemDetailDiv);

            let attractionItemMrtCategoryDiv = document.createElement("div");
            attractionItemMrtCategoryDiv.className = "attraction__item__mrtCategory";

            let mrtDiv=document.createElement("div");
            mrtDiv.className = "attraction__item__mrtCategory__mrt";

            let categoryDiv=document.createElement("div");
            categoryDiv.className = "attraction__item__mrtCategory__category";
            
            mrtDiv.textContent = detail['mrt'];
            attractionItemMrtCategoryDiv.appendChild(mrtDiv);

            categoryDiv.textContent = detail['category'];
            attractionItemMrtCategoryDiv.appendChild(categoryDiv);

            attractionItemDiv.appendChild(attractionItemMrtCategoryDiv);

            let container = document.querySelector(".attraction__container");

            isLoading = false; 

            container.appendChild(attractionItemDiv);

            attractionItemDetailDiv.addEventListener("mouseenter", function() {
                attractionItemDetailDiv.style.opacity = 0.75;
            });
            attractionItemDetailDiv.addEventListener("mouseleave", function() {
                attractionItemDetailDiv.style.opacity =1;
            });
            attractionItemDetailDiv.addEventListener("click", function() {
                window.location.href = `/attraction/${detail['id']}`;
            });

        }
        if(data["nextPage"]!==null){
            page=data["nextPage"];
        }
        if (data["nextPage"]===null){
            page++;
            lastPage=true
        }
    });
}

function mrtList() {
    
    fetch('/api/mrts').then(function(response) {
        return response.json();
    }).then(function(data) {
        for (let mrt of data['data']){
            let mrtListContainerItem = document.createElement("div");
            mrtListContainerItem.className = "mrtList__container__sub__item";

            mrtListContainerItem.textContent=mrt;

            mrtListContainerItem.addEventListener("click", function() {

                mrtListContainerItem.classList.add("enlarge");

                setTimeout(function() {
                    mrtListContainerItem.classList.remove("enlarge");
                }, 200);


                let container = document.querySelector(".attraction__container");
                page=0;
                searchInput.value = mrt;
                container.innerHTML = "";
                loadNextPage();
            });

            mrtListContainerItem.addEventListener("mouseenter", function() {
                mrtListContainerItem.style.color = "black"; 
            });
            mrtListContainerItem.addEventListener("mouseleave", function() {
                mrtListContainerItem.style.color = "#666666"; 

            });

            let mrtListContainer = document.querySelector(".mrtList__container__sub");
            mrtListContainer.appendChild(mrtListContainerItem);

        }
    })

}
mrtList()

let leftIcon= document.getElementById('left__icon');
let subContainer = document.querySelector('.mrtList__container__sub');
let rightIcon= document.getElementById('right__icon');




leftIcon.addEventListener("click", function() {
    let currentWidth = subContainer.clientWidth;
    let leftWidth = currentWidth * 0.9;
    
    subContainer.scrollLeft -= leftWidth;
    // 暴力解法
    // let interval =5;
    // let steps = 10;

    // let step = 0;
    // const scrollInterval = setInterval(function() {
    //     if (step < steps) {
    //         subContainer.scrollLeft -= leftWidth / steps;
    //         step++;
    //     } else {
    //         clearInterval(scrollInterval); // 停止計時器
    //     }
    // }, interval);
});


rightIcon.addEventListener("click", function() {

    let currentWidth = subContainer.clientWidth;
    let rightWidth = currentWidth * 0.9;

    subContainer.scrollLeft += rightWidth ;
    // 暴力解法
    // let interval = 5;
    // let steps = 10;

    // let step = 0;
    
    // const scrollInterval = setInterval(function() {
    //     if (step < steps) {
    //         subContainer.scrollLeft += rightWidth / steps;
    //         step++;
    //     } else {
    //         clearInterval(scrollInterval); 
    //     }
    // }, interval);
});

let searchButton = document.querySelector(".search__btn");
searchButton.addEventListener("click", function() {
    let container = document.querySelector(".attraction__container");
    page=0;
    keyword = searchInput.value;
    container.innerHTML = "";
    loadNextPage();
    });

    loadNextPage();

window.addEventListener("scroll", function () {
    const lastItem = document.querySelector('.attraction__container:last-child');
    const lastItemBounding = lastItem.getBoundingClientRect();

    // 當捲動到底部時觸發載入下一頁
    if (lastItemBounding.bottom <= window.innerHeight && !isLoading) {
        loadNextPage();
    }
});

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

    let meberData = {
        email: email,
        password: password
    };

    fetch('/api/user/auth', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(meberData)
    }).then(response => {
        if (response.ok) {
            window.location.reload();
            return response.json().then(responseData => {
                let jwtToken = responseData .token;
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

