import { app } from "../config/db-config.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';



const auth = getAuth();



// this function return all the patient ids
async function getAllPIds() {
    return new Promise((resolve, reject) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `patients/`)).then((snapshot) => {
            if (snapshot.exists()) {
                const patients = snapshot.val();
                const pIds = [];

                for (const key in patients) {
                    pIds.push(patients[key].pId);
                }

                resolve(pIds); // Resolve the promise with the pIds array
            } else {
                console.log("No data available");
                resolve([]); // Resolve with an empty array if no data is available
            }
        }).catch((error) => {
            console.error(error);
            reject(error); // Reject the promise if there is an error
        });
    });
}




async function checkAuth() {
    try {

        let pIds = await getAllPIds();

        // console.log(auth.currentUser.uid);

        if ((!pIds.includes(auth.currentUser.uid)) ||
            (auth.currentUser.uid != localStorage.getItem("uid")) ||
            (localStorage.getItem("uid") == null)) {

            alert("You have no authorization to access this page...");

            window.location.replace("./index.html");
        }
    } catch (error) {
        console.error('Error fetching pIds:', error);
    }
}


export { checkAuth };

