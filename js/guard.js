function getLoggedUser() {

    const token =
        localStorage.getItem("token");

    const user =
        localStorage.getItem("user");


    if (!token || !user) {

        window.location.href =
            "../index.html";

        return null;
    }


    try {

        return JSON.parse(user);

    }
    catch {

        localStorage.clear();

        window.location.href =
            "../index.html";

        return null;
    }
}


function requireAdmin() {

    const user =
        getLoggedUser();


    if (!user)
        return null;


    if (
        String(user.role)
            .toLowerCase() !==
        "admin"
    ) {

        window.location.href =
            "employee-dashboard.html";

        return null;
    }


    return user;
}


function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "../index.html";
}