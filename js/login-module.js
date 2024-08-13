import { app } from "./config/db-config.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';



/**
 *  this function checks the user is available with provided id
 * this function used in login function
 */


async function getAllPIds(userRole, id) {
    return new Promise((resolve, reject) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${userRole}/${id}`)).then((snapshot) => {
            if (snapshot.exists()) {

                resolve(true);
            } else {
                console.log("no data avalilable");
                resolve(false);
            }
        }).catch((error) => {
            console.error(error);
            reject(false);
        });
    });
}




// When login from get's submitted
document.getElementById("Login-Form").addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from submitting

    let formData = new FormData(document.getElementById("Login-Form"));

    let formDataObj = {};
    formData.forEach((value, key) => {
        formDataObj[key] = value;
    });

    //---- get form data
    let email = formDataObj.email;
    let password = formDataObj.password;
    let userRole = formDataObj.user;

    if (userRole != null) {  //if userRole is selected

        if (email.trim() != "" && password.trim() != "") {

            const auth = getAuth();

            signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {

                    const user = userCredential.user;

                    localStorage.setItem("uid", user.uid);


                    /**
                     * Check if the user selected user role is available or not
                     * if it is then redirect user to their dashboard 
                     */
                    const ISVALID = await getAllPIds(userRole, user.uid);

                    if (ISVALID) {   //if user found with selected user-role
                        (userRole == "patients") ? window.location.replace("../patient-dashboard.html")
                            : (userRole == "doctors") ? window.location.replace("../doctor UI/dashboard.html")
                                : window.location.replace("../Reciptionist UI/dashboard.html");


                    } else {
                        alert("Plese select proper user role..");
                    }


                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log("error = ", errorMessage);
                    alert(errorCode);
                });
        }
    } else {  // if user-role is not selected..
        alert("Select user category..");
    }


});


// ---------------------------------------------------


// Write data into RealtimeDB
function writeUserData(pId, name, email, mobile, password) {
    const db = getDatabase();
    set(ref(db, 'patients/' + pId), {
        pId,
        name,
        email,
        mobile,
        password
    });
}

// When Register form get's submitted
document.getElementById("Register-Form").addEventListener("submit", (e) => {
    e.preventDefault();


    let RegisterForm = document.getElementById("Register-Form");

    let registerData = new FormData(RegisterForm);

    let RegisterObj = {};

    registerData.forEach((value, key) => {
        if (value.trim() == "") {
            alert("All values are required...");
        }
        else {
            RegisterObj[key] = value;
        }
    });

    if (RegisterObj.password != RegisterObj.confirm_password) {
        alert("Password and Confirm-Password Must be same !..");
    }

    // Create user Auth.
    else {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, RegisterObj.email, RegisterObj.password)
            .then((userCredential) => {

                // Get User
                const user = userCredential.user;

                // Write Patient into Realtime DB
                writeUserData(user.uid, RegisterObj.name, user.email, RegisterObj.mobile, RegisterObj.password);

                localStorage.setItem("uid", user.uid);
                // console.log(user);

                window.location.replace("patient-dashboard.html");


            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                alert(errorCode);
            });
        console.log(RegisterObj);
    }
});
