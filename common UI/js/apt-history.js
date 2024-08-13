import { app } from "../../js/config/db-config.js";
import { getDatabase, query, ref, get, child, update, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';



// Collecting the url parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const pId = urlParams.get('patient');


if (pId == null) {
    alert("Important parameters are missing !..");

    backToPrevious();
}

console.groupCollapsed("Url Parameters = ");
console.log("patient id = ", pId);
console.groupEnd();

document.getElementById("BACK_BTN").addEventListener("click", () => {
    backToPrevious();
});



const auth = getAuth();

onAuthStateChanged(auth, async (user) => {

    if (user && user.uid == localStorage.getItem("uid")) {
        // getting patient info
        let ptObj = await getPatientById(pId);
        let aptObj = await getAptsByPId(pId);

        console.groupCollapsed("patient Obj = "); console.log(ptObj); console.groupEnd();
        console.groupCollapsed("Appoint Obj = "); console.log("Appointment Obj = ", aptObj); console.groupEnd();




        let isPatient = ((user.uid == aptObj[0].pId) ? true : false);

        writeUserInfo(ptObj);
        writeTable(aptObj, isPatient);

        document.getElementById("SEARCH_INPUT").addEventListener("change", () => {
            searchMethod(aptObj, isPatient);
        });
    }
    else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});



/**
 * This function returns the patient details by the patient-id
 */
async function getPatientById(pId) {
    const dbRef = ref(getDatabase());
    let snapshot = await get(child(dbRef, `patients/${pId}`));

    if (snapshot.exists()) {

        return {
            name: snapshot.val().name,
            email: snapshot.val().email,
            mobile: snapshot.val().mobile
        }
    } else {
        console.log("No data available");
    }
}


// Gets Appointments by Patient Id
function getAptsByPId(pId) {
    return new Promise((resolve, reject) => {

        const dbRef = ref(getDatabase(), 'appointments'); // Reference to the correct path in the database
        const queryRef = query(dbRef, orderByChild('pId'), equalTo(pId));

        let Aptdata = [];

        get(queryRef).then(async (snapshot) => {
            if (snapshot.exists()) {
                let promises = [];

                Object.entries(snapshot.val()).forEach((aptObj) => {

                    let dId = aptObj[1].dId;

                    // Push each async call into promises array
                    let doctorPromise = get(child(ref(getDatabase()), `doctors/${dId}`))
                        .then((snapshot) => {
                            let drName = snapshot.val().name;
                            let fees = snapshot.val().fees;

                            let dataObj = {
                                aId: aptObj[0],
                                pId: aptObj[1].pId,
                                name: drName,
                                fees: fees,
                                date: aptObj[1].date,
                                status: aptObj[1].status,
                                action: aptObj[1].Action,
                                bill_status: aptObj[1].bill_status || null
                            };

                            Aptdata.push(dataObj);
                        })
                        .catch((error) => {
                            console.error(error);
                        });

                    promises.push(doctorPromise);
                });

                // Wait for all promises to resolve
                await Promise.all(promises);

                resolve(Aptdata);
            } else {
                console.log('No data available');
                resolve(Aptdata); // Resolve with empty array if no data
            }
        }).catch((error) => {
            console.error('Error fetching data:', error);
            reject(error);
        });
    });
}


// ---back to the previous page..
function backToPrevious() {
    let previousLocation = document.referrer;

    if (previousLocation) {
        window.location.replace(previousLocation);
    } else {
        history.back(-1);
    }
}

// writes the patient info on the page
function writeUserInfo(ptObj) {
    document.getElementById("P_NAME").innerText = ptObj.name;
    document.getElementById("P_EMAIL").innerText = ptObj.email;
    document.getElementById("MOBILE").innerText = ptObj.mobile;
}
// ------------------------------------

function searchMethod(AllData, isPatient) {

    let search = document.getElementById("SEARCH_INPUT").value;

    if (search.trim() != "") {

        let searchData = AllData.filter((e) => {

            for (const itr in e) {

                if (e[itr].toLowerCase().includes(search.toLowerCase())) {

                    return true;
                }
            }
        });

        writeTable(searchData, isPatient);
    } else {
        // putIntoTable(localStorage.getItem("uid"));
        writeTable(AllData, isPatient);
    }
}

// -----------------------------------

function writeTable(AllData, isPatient) {


    let aptTabelBody = document.getElementById("TBL_BODY");
    aptTabelBody.innerHTML = '';



    AllData.forEach((aptData) => {

        let ACTION;

        if ((aptData.bill_status == "PAID" || aptData.status == "Pending") && isPatient) {
            ACTION = `<a href="../common UI/apt-details.html?appointment=${aptData.aId}&patient=${aptData.pId}" class="btn" >View</a>`;
        } else {
            ACTION = `<p class="btn btn-secondary pay_bill_btn" apt-id="${aptData.aId}">Pay Bill</p>`;
        }

        if (!isPatient) {
            ACTION = `<a href="../common UI/apt-details.html?appointment=${aptData.aId}&patient=${aptData.pId}" class="btn" >View</a>`;
        }

        aptTabelBody.innerHTML += `
                        <tr>
                                <td>${aptData.name}</td>
                                <td>${aptData.date}</td>
                                <td>${aptData.status}</td>
                                <td>${aptData.fees}</td>
                                <td>${ACTION}</td>
                        </tr>
                        `;

    });

    document.querySelectorAll(".pay_bill_btn").forEach(e => {

        e.addEventListener("click", () => {
            payBill(e.getAttribute("apt-id"));
        });
    });


    document.querySelector(".Spinner").classList.add("hide-spinner");
}


// function is responsible for paying the bills
function payBill(aId) {

    const db = getDatabase();
    const appointmentRef = ref(db, `appointments/${aId}`);

    const updates = {
        bill_status: "PAID"
    };

    update(appointmentRef, updates)
        .then(() => {
            alert('Bill paid Successfully...');

            window.location.reload();
        })
        .catch((error) => {
            console.error('Error Cancling appointment:', error);
        });
}
