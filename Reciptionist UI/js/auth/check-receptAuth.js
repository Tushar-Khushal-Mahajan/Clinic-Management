import { app } from "../../../js/config/db-config.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';



const auth = getAuth();



// this function return all the Receptionist ids
async function getAllPIds() {
    return new Promise((resolve, reject) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `Receptionist/`)).then((snapshot) => {
            if (snapshot.exists()) {
                const patients = snapshot.val();
                const rIds = [];

                for (const key in patients) {
                    rIds.push(patients[key].rId);

                    // console.log(patients[key].rId);
                }

                resolve(rIds); // Resolve the promise with the pIds array
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

        let rIds = await getAllPIds();
        // console.log("rids = ", rIds);


        // console.log(auth.currentUser.uid);

        // console.log("uid = ", auth.currentUser.uid);

        if ((!rIds.includes(auth.currentUser.uid)) ||
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

