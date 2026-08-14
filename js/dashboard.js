// async function loadDashboard() {

    // try {

        // const result =
            // await apiRequest(
                // "/admin/dashboard"
            // );


        // document
            // .getElementById(
                // "totalEmployees"
            // )
            // .innerText =
            // result.totalEmployees || 0;


        // document
            // .getElementById(
                // "presentToday"
            // )
            // .innerText =
            // result.presentToday || 0;


        // document
            // .getElementById(
                // "pendingLeaves"
            // )
            // .innerText =
            // result.pendingLeaves || 0;


        // document
            // .getElementById(
                // "totalAdvance"
            // )
            // .innerText =
            // `₹${result.totalOutstandingAdvance || 0}`;

    // }
    // catch (error) {

        // console.error(error);

    // }

// }


// loadDashboard();


async function loadDashboard() {

    try {

        const result =
            await apiRequest(
                "/admin/dashboard"
            );


        document
            .getElementById(
                "totalEmployees"
            )
            .innerText =
            result.totalEmployees ?? 0;


        document
            .getElementById(
                "presentToday"
            )
            .innerText =
            result.presentToday ?? 0;


        document
            .getElementById(
                "pendingLeaves"
            )
            .innerText =
            result.pendingLeaves ?? 0;


        document
            .getElementById(
                "totalAdvance"
            )
            .innerText =
            `₹${Number(
                result.totalOutstandingAdvance || 0
            ).toLocaleString("en-IN")}`;

    }
    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }
}


loadDashboard();