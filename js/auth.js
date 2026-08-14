document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const error =
                document
                    .getElementById("loginError");


            error.innerText = "";


            try {
              login(username,password);
                // const result =
                    // await apiRequest(
                        // "/auth/login",
                        // {
                            // method: "POST",

                            // body: JSON.stringify({
                                // username,
                                // password
                            // })
                        // }
                    // );


                /*
                    Expected API response:

                    {
                        token: "...",
                        user: {
                            userId: 1,
                            employeeId: 5,
                            name: "Rahul",
                            role: "Admin"
                        }
                    }
                */


                localStorage.setItem(
                    "token",
                    username
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        username
                    )
                );


                // if (
                    // username
                        // .toLowerCase() ===
                    // "admin"
                // ) {

                    // window.location.href =
                        // "Pages/admin-dashboards.html";

                // }
                // else {

                    // window.location.href =
                        // "Pages/employee-dashboard.html";

                // }

            }
            catch (err) {

                error.innerText =
                    err.message;

            }

        }
    );
	
	// const API_BASE_URL =
    // "http://localhost:5000/api";
async function login(
    username,
    password
) {

            const error =
                document
                    .getElementById("loginError");


            error.innerText = "";
    const response =
        await fetch(
            `${API_BASE_URL}/auth/login`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        username,

                        password

                    })

            }
        );


    const data =
        await response.json();


    if (!data.success) {

         error.innerText =
                    data.message;

    }


    localStorage.setItem(
        "token",
        data.token
    );


    localStorage.setItem(
        "user",
        JSON.stringify(
            data.user
        )
    );


    if (
        String(
            data.user.role
        ).toLowerCase()
        === "admin"
    ) {

        window.location.href =
             "Pages/admin-dashboards.html";

    }
    else {

        window.location.href =
            "Pages/employee-dashboard.html";


    }

}