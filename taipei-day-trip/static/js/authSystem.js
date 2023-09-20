// let login=document.getElementById("login")
// let dialogMask=document.querySelector(".dialogMask")

// document.getElementById('auth').addEventListener("click", function() {
//     login.open = true;
//     dialogMask.style.display = 'block';
// })

// document.getElementById("closeLogin").addEventListener("click", function() {
//     dialogMask.style.display = 'none';

//     let emailId = document.getElementById("signInEmail");
//     let passwordId =  document.getElementById("signInPassword");
//     emailId.value = "";
//     passwordId.value = "";

//     let loginMessage=document.getElementById("loginMessage")
//     loginMessage.style.display = 'none';

//     login.close();
// })

// document.getElementById("signInButton").addEventListener("click", function() {
//     let email = document.getElementById("signInEmail").value;
//     let password = document.getElementById("signInPassword").value;

//     let data = {
//         email: email,
//         password: password
//     };

//     fetch('/api/user/auth', {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     }).then(response => {
//         if (response.ok) {
//             window.location.reload();
//             return response.json().then(data => {
//                 let jwtToken = data.token;
//                 localStorage.setItem("token", jwtToken);
//             });
//         } 
//         else{
//             return response.json().then(errorData => {
//                 let emailId = document.getElementById("signInEmail");
//                 let passwordId =  document.getElementById("signInPassword");
                
//                 let errorMessage="";
//                 if( emailId.value == "" || passwordId.value == ""){
//                     errorMessage = "請填寫帳號或密碼";

//                 }
//                 else{
//                     errorMessage = errorData.message;
//                 }
//                 let loginMessage=document.getElementById("loginMessage") 

//                 loginMessage.textContent = errorMessage; 
//                 loginMessage.style.display='block';

//                 emailId.value = "";
//                 passwordId.value = "";

//                 let loginMain = document.getElementById('loginMain');
//                 loginMain.addEventListener('click', function() {
//                         loginMessage.style.display='none';
//                 });
                
//             });
//         }
//     })
// });


// document.addEventListener('DOMContentLoaded', function() {
//     let jwtToken = localStorage.getItem("token");
//     fetch('/api/user/auth', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${jwtToken}`
//         }
//     }).then(response => {
//         if (response.ok) {
//             signOut.style.display='block';
//             auth.style.display='none';
//         }
//         else{
//             return response.json().then(errorData => {
//                 signOut.style.display='none';
//                 auth.style.display='block';
//             })
//         }
//     })
// });

// let toSignUp=document.getElementById("toSignUp")
// let signUp=document.getElementById("signUp")

// toSignUp.addEventListener("click",  function() {
//     login.close();
//     signUp.open = true;
// });

// document.getElementById("closeSignUp").addEventListener("click", function() {
//     dialogMask.style.display = 'none';
    
//     let nameId = document.getElementById("signUpName");
//     let emailId = document.getElementById("signUpEmail");
//     let passwordId =  document.getElementById("signUpPassword");

//     nameId.value="";
//     emailId.value = "";
//     passwordId.value = "";

//     let signUpMessage=document.getElementById("signUpMessage")
//     signUpMessage.style.display = 'none';

//     signUp.close();
// })

// document.getElementById("signUpButton").addEventListener("click", function() {
//     let namePattern = /^[a-zA-Z\u4e00-\u9fa5\s]+$/;
//     let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
//     let signUpMessage=document.getElementById("signUpMessage") 

//     let nameId = document.getElementById("signUpName")
//     let emailId = document.getElementById("signUpEmail");
//     let passwordId =  document.getElementById("signUpPassword");
//     let errorMessage = "";

//     let data = {
//         name:nameId.value,
//         email: emailId.value,
//         password: passwordId.value
//     };

//     if (nameId.value == "" || emailId.value == "" || passwordId.value == ""){
//         errorMessage = "請輸入完整資訊";

//         signUpMessage.style.display = 'block';
//         signUpMessage.textContent = errorMessage;
        
//         nameId.value="";
//         emailId.value = "";
//         passwordId.value = "";
//     }
//     else if(!emailPattern.test(emailId.value) || !namePattern.test(nameId.value)){
//         errorMessage = "姓名或email格式不正確"; 

//         signUpMessage.style.display = 'block';
//         signUpMessage.textContent = errorMessage;

//         nameId.value="";
//         emailId.value = "";
//         passwordId.value = "";
//     }
//     else{
//         fetch('/api/user', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//             }).then(response => {
//                 if (response.ok) {
//                         signUpMessage.textContent = "註冊成功，請登入系統";
//                         signUpMessage.style.color = "#00FF00"
//                         signUpMessage.style.display='block';

//                         nameId.value="";
//                         emailId.value = "";
//                         passwordId.value = "";
//                     }
//                 else{
//                     return response.json().then(errorData => {
                        
//                         errorMessage = errorData.message;

//                         signUpMessage.textContent = errorMessage;
//                         signUpMessage.style.color = "#ff0000"; 
//                         signUpMessage.style.display='block';


//                         nameId.value="";
//                         emailId.value = "";
//                         passwordId.value = "";
//                     })
//                 }
//         })
//     }

//     let signUpMain = document.getElementById('signUpMain');
//     signUpMain.addEventListener('click', function(event) {
//         if (event.target.id !== "signUpButton") {
//             signUpMessage.style.display='none';
//         }
//     });
    
// })
// let toSignIn = document.getElementById("toSignIn")


// toSignIn.addEventListener("click",  function() {
//     signUp.close();
//     login.open = true;

//     let signUpMessage=document.getElementById("signUpMessage") 
//     signUpMessage.style.display = 'none';
// });

// let signOut = document.getElementById('signOut');
// let auth = document.getElementById('auth');
// signOut.addEventListener("click",  function() {
//     localStorage.removeItem("token");
//     window.location.reload();
// });