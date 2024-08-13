import { app } from "../../../js/config/db-config.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';



const auth = getAuth();



// this function return all the doctor ids
async function getAllPIds() {
    return new Promise((resolve, reject) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `doctors/`)).then((snapshot) => {
            if (snapshot.exists()) {
                const doctors = snapshot.val();
                const dIds = [];

                for (const key in doctors) {
                    dIds.push(doctors[key].dId);

                    // console.log(patients[key].rId);
                }

                resolve(dIds); // Resolve the promise with the pIds array
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

        let dIds = await getAllPIds();

        if ((!dIds.includes(auth.currentUser.uid)) ||
            (auth.currentUser.uid != localStorage.getItem("uid")) ||
            (localStorage.getItem("uid") == null)) {

            alert("You have no authorization to access this page...");

            window.location.replace("../../../index.html");
        }
    } catch (error) {
        console.error('Error fetching pIds:', error);
    }
}


export { checkAuth };

