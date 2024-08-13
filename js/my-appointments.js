import { app } from "./config/db-config.js";
import { checkAuth } from "./auth/check-patient-auth.js"
import { query } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getDatabase, ref, get, child, update, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged, } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';


const auth = getAuth();


// Check if user is logged in or not..
onAuthStateChanged(auth, (user) => {

    if (user && user.uid == localStorage.getItem("uid")) {
        checkAuth();

        putIntoTable(user.uid);


        // getAptsByUId(user.uid);

    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});

function cancleApt(btn, pId) {

    // console.log(btn.target.getAttribute("aptid"));

    let ch = confirm("Do you want to cancle this appointment");

    if (ch) {
        let aId = btn.target.getAttribute("aptid");

        const db = getDatabase();
        const appointmentRef = ref(db, `appointments/${aId}`);

        const updates = {
            status: "Cancle",
            Action: "Cancle By Patient"
        };

        update(appointmentRef, updates)
            .then(() => {
                // console.log('Appointment Cancled successfully');
                alert("Appointment Cancled");

                putIntoTable(pId);
            })
            .catch((error) => {
                console.error('Error Cancling appointment:', error);
            });
    }


}


// Gets Appointments by Patient Id
function getAptsByUId(pId) {
    return new Promise((resolve, reject) => {

        let aptTabelBody = document.getElementById("TBL_BODY");
        aptTabelBody.innerHTML = '';

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

// Example usage
async function putIntoTable(pId) {
    // alert(pId);

    var AllData = await getAptsByUId(pId);

    console.groupCollapsed("ALL APT DATA = "); console.log(AllData); console.groupEnd();

    writeTable(AllData);

    // -------------
    document.getElementById("SEARCH_INPUT").addEventListener("change", (e) => { searchMethod(e, AllData); });



}
// ------------------------------------

function searchMethod(element, AllData) {

    let search = element.target.value;

    if (search.trim() != "") {

        let searchData = AllData.filter((e) => {

            for (const itr in e) {

                if (e[itr].toLowerCase().includes(search.toLowerCase())) {

                    return true;
                }
            }
        });

        // print data into console
        console.groupCollapsed("Search Result = "); console.log(searchData); console.groupEnd();

        writeTable(searchData);
    } else {
        // print data into console
        console.groupCollapsed("Search Result = "); console.log(AllData); console.groupEnd();

        writeTable(AllData);
    }
}

// -----------------------------------

function writeTable(AllData) {

    let aptTabelBody = document.getElementById("TBL_BODY");
    aptTabelBody.innerHTML = '';


    AllData.forEach((aptData) => {

        // console.log("appointment data = ", aptData);

        let ACTION;
        if (aptData.status === "Pending") {
            ACTION = `<button class="cancle-btn" aptId = '${aptData.aId}'">
                                                Cancle
                                      </button>`;
        } else if (aptData.status === "Complete") {
            if (aptData.bill_status == "PAID") {
                ACTION = `<a href="../common UI/apt-details.html?appointment=${aptData.aId}&patient=${aptData.pId}" >${aptData.action}</a>`;
            } else {
                ACTION = `<p class="btn btn-secondary pay_bill_btn" apt-id="${aptData.aId}">Pay Bill</p>`;
            }

        } else {
            ACTION = `<p style="background-color:var(--warning)">${aptData.action}</p>`;
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


        // Add event listener to the "Cancel" button after it has been added to the DOM
        if (aptData.status === "Pending") {
            const cancelBtn = aptTabelBody.querySelectorAll('.cancle-btn');

            cancelBtn.forEach((btn) => {
                btn.addEventListener('click', (e) => { cancleApt(e, localStorage.getItem('uid')); });
            });
        }
    });

    document.querySelectorAll(".pay_bill_btn").forEach(e => {

        e.addEventListener("click", () => {
            payBill(e.getAttribute("apt-id"));
        })
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
