import { app } from "../../js/config/db-config.js";
import { checkAuth } from "./auth/check-receptAuth.js"
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';


// check login user
checkAuth();

// Write data into RealtimeDB
function writeDoctorData(dId, name, email, specification, fees, password) {
    const db = getDatabase();
    set(ref(db, 'doctors/' + dId), {
        dId,
        name,
        email,
        specification,
        fees,
        password
    });
}

document.getElementById("ADD_DOCTOR").addEventListener("submit", (e) => {
    e.preventDefault();


    let data = new FormData(document.getElementById("ADD_DOCTOR"));


    let doctorObj = {};

    data.forEach((value, key) => {
        if (value.trim() == "") {
            alert("All values are required...");

            throw ("All Fields Are Rquired");

            console.log("hello");
        }
        else {
            doctorObj[key] = value;
        }
    });

    // Add doctor into authentication
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, doctorObj.email, doctorObj.password)
        .then((userCredential) => {

            // Get Doctor
            const doctor = userCredential.user;

            // logging :-
            console.groupCollapsed("Doctor to be write = "); console.table(
                [doctor, doctorObj]
            ); console.groupEnd();

            // Write doctor data into realtime DB
            writeDoctorData(doctor.uid, doctorObj.name, doctor.email, doctorObj.specification, doctorObj.fees, doctorObj.password)

            alert("Doctor Added..");

            document.getElementById("RESEAT_BTN").click();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            alert(errorCode);
        });

});