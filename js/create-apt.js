import { app } from "./config/db-config.js";
import { checkAuth } from "./auth/check-patient-auth.js"
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged, } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';


const auth = getAuth();




// Check if user is logged in or not..
onAuthStateChanged(auth, (user) => {

    if (user && user.uid == localStorage.getItem("uid")) {

        // check authorization
        checkAuth();

        getDoctors("general");


    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});


// insert doctors into Doctor dropdown based on their Specification
function getDoctors(specification) {

    const dbRef = ref(getDatabase());

    get(child(dbRef, `doctors/`)).then((snapshot) => {
        if (snapshot.exists()) {
            const doctors = snapshot.val();

            const doctorList = [];

            let doctorMenu = document.getElementById("DOCTOR_MENU");
            doctorMenu.innerHTML = '';

            for (const key in doctors) {
                if (doctors[key].specification === specification) {

                    let doctor = [];

                    doctor.push(doctors[key].name);
                    doctor.push(doctors[key].dId);

                    doctorList.push(doctor);

                    doctorMenu.innerHTML += `
                            <option value="${doctors[key].dId}">${doctors[key].name}</option>
                        `;
                }
            }
        } else {
            alert(`Currenlty Doctor with "${specification}" is not available.. `)
        }
    }).catch((error) => {
        console.error(error);
    });
}


// if Specification manu change
document.getElementById("SEPECIALIZATION_MENU").addEventListener("change", () => {
    let specification = document.getElementById("SEPECIALIZATION_MENU").value;

    // load doctors based on ther specification..
    getDoctors(specification);
});

//==========================================================================

function writeAptData(aId, date, status, Action, message, pId, dId) {
    console.log("going to write");
    const db = getDatabase();
    set(ref(db, 'appointments/' + aId), {
        date,
        status,
        Action,
        message,
        Prescription: "",
        pId,
        dId,
    }).then(() => {
        alert("appointment send successfully..");

        document.getElementById("RESET_BTN").click();

    }).catch(error => {
        console.error(error);
    });
}


// when appointment Form is submitted
document.getElementById("APT_FORM").addEventListener("submit", (e) => {
    e.preventDefault();

    let ch = confirm("Do you want to save this appointment");

    if (ch) {
        let formData = new FormData(document.getElementById("APT_FORM"));

        let aptObj = {};

        formData.forEach((value, key) => {
            aptObj[key] = value;
        });

        console.groupCollapsed("Data that going to be saved"); console.log(aptObj); console.groupEnd();

        let aId = new Date().getTime();
        let date = new Date().toLocaleDateString();
        let status = "Pending";
        let action = "Cancle";
        let pId = localStorage.getItem("uid");


        writeAptData(aId, date, status, action, aptObj.Prescription, pId, aptObj.did);
    }

});

