let currentEmployee = null;


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(

    "DOMContentLoaded",
    async function () {
debugger
        const user =
            getLoggedUser();


        if (!user)
            return;


        /*
          Employee स्वतःचे dashboardच पाहू शकतो.
        */

        // if (
            // String(user.role)
                // .toLowerCase() !==
            // "employee"
        // ) {

            // window.location.href =
                // "admin-dashboard.html";

            // return;

        // }


        try {

            await loadEmployeeProfile();

            await loadTodayAttendance();

           // await loadAttendanceSummary();

            await loadLeaves();

            await loadSalary();

           // await loadAdvance();

        }
        catch (error) {

            console.error(
                error
            );

        }

    }
);


/* =========================================
   PROFILE
========================================= */

async function loadEmployeeProfile() {

    const result =
        await apiRequest(
            "/employees/2"
        );


    currentEmployee =
        result.data || result;

localStorage.setItem("EmployeeId",currentEmployee.EmployeeId);
    document
        .getElementById(
            "employeeName"
        )
        .innerText =
        currentEmployee.EmployeeName ||
        "कर्मचारी";


    document
        .getElementById(
            "welcomeName"
        )
        .innerText =
        currentEmployee.EmployeeName ||
        "कर्मचारी";


    document
        .getElementById(
            "employeeCode"
        )
        .innerText =
        currentEmployee.EmployeeCode ||
        "-";


    document
        .getElementById(
            "designation"
        )
        .innerText =
        currentEmployee.Designation ||
        "-";


    document
        .getElementById(
            "businessType"
        )
        .innerText =
        currentEmployee.businessType ||
        "-";


    document
        .getElementById(
            "mobile"
        )
        .innerText =
        currentEmployee.Email ||
        "-";

}


/* =========================================
   TODAY ATTENDANCE
========================================= */

async function loadTodayAttendance() {

    const result =
        await apiRequest(
            "/attendance/daily/today"
        );


    const attendance =
        result.data || result;


    const statusElement =
        document.getElementById(
            "todayAttendanceStatus"
        );


    const detailsElement =
        document.getElementById(
            "todayAttendanceDetails"
        );


    const checkInButton =
        document.getElementById(
            "checkInButton"
        );


    const checkOutButton =
        document.getElementById(
            "checkOutButton"
        );


    if (!attendance) {

        statusElement.innerText =
            "Absent";


        checkInButton.disabled =
            false;

        checkOutButton.disabled =
            true;


        detailsElement.innerText =
            "आजची उपस्थिती अजून नोंदलेली नाही.";

        return;

    }


    if (attendance.Status === "Present") {

        statusElement.innerText =
            "Present";

        statusElement.className =
            "status status-approved";

    }


    if (attendance.CheckInTime) {

        checkInButton.disabled =
            true;

        checkOutButton.disabled =
            false;

    }


    if (attendance.CheckOutTime) {

        checkOutButton.disabled =
            true;

    }


    detailsElement.innerHTML = `

        <strong>
            Check In:
        </strong>

        ${formatDateTime(
            attendance.CheckInTime
        )}

        &nbsp;&nbsp;

        <strong>
            Check Out:
        </strong>

        ${formatDateTime(
            attendance.CheckOutTime
        )}

    `;

}


/* =========================================
   CHECK IN
========================================= */

async function checkIn() {

    try {

        await apiRequest(
            "/employee/attendance/check-in",
            {
                method: "POST"
            }
        );


        alert(
            "आजची उपस्थिती नोंदवली आहे."
        );


        await loadTodayAttendance();

        await loadAttendanceSummary();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================
   CHECK OUT
========================================= */

async function checkOut() {

    try {

        await apiRequest(
            "/employee/attendance/check-out",
            {
                method: "POST"
            }
        );


        alert(
            "Check Out नोंदवले आहे."
        );


        await loadTodayAttendance();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================
   ATTENDANCE SUMMARY
========================================= */

async function loadAttendanceSummary() {

    const result =
        await apiRequest(
            "/employee/attendance/summary"
        );


    const summary =
        result.data || result;


    document
        .getElementById(
            "presentDays"
        )
        .innerText =
        summary.presentDays || 0;


    document
        .getElementById(
            "holidayDays"
        )
        .innerText =
        summary.holidayDays || 0;


    document
        .getElementById(
            "approvedLeaveDays"
        )
        .innerText =
        summary.approvedLeaveDays || 0;


    document
        .getElementById(
            "absentDays"
        )
        .innerText =
        summary.absentDays || 0;

}


/* =========================================
   LEAVE APPLY
========================================= */

document
    .getElementById("leaveForm")
    .addEventListener(
        "submit",
        async function (event) {
debugger
            event.preventDefault();


            const fromDate =
                document
                    .getElementById(
                        "leaveFromDate"
                    )
                    .value;


            const toDate =
                document
                    .getElementById(
                        "leaveToDate"
                    )
                    .value;


            if (
                new Date(toDate) <
                new Date(fromDate)
            ) {

                alert(
                    "To Date ही From Date पेक्षा कमी असू शकत नाही."
                );

                return;

            }


            const request = {
               employeeId:localStorage.getItem("EmployeeId"),
                leaveTypeId:
                    document
                        .getElementById(
                            "leaveType"
                        )
                        .value,

                fromDate,

                toDate,

                reason:
                    document
                        .getElementById(
                            "leaveReason"
                        )
                        .value
                        .trim()

            };


            try {

                await apiRequest(
                    "/leaves",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                request
                            )
                    }
                );


                alert(
                    "Leave Application Admin कडे पाठवली आहे."
                );


                document
                    .getElementById(
                        "leaveForm"
                    )
                    .reset();


                await loadLeaves();

            }
            catch (error) {

                alert(
                    error.message
                );

            }

        }
    );


/* =========================================
   LEAVE HISTORY
========================================= */

async function loadLeaves() {
// LocalStorage मधून EmployeeId मिळवा
const employeeId = localStorage.getItem("EmployeeId");

// URL तयार करा
const url = `/leaves/employee/${employeeId}`;
    const result =
        await apiRequest(
            url
        );


    const leaves =
        Array.isArray(result)
            ? result
            : result.data || [];


    const table =
        document.getElementById(
            "leaveTable"
        );


    if (!leaves.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center">

                    कोणतीही Leave Application नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    leaves.forEach(
        leave => {

            const status =
                String(
                    leave.Status || "Pending"
                );


            let statusClass =
                "status-pending";


            if (
                status.toLowerCase()
                === "approved"
            ) {

                statusClass =
                    "status-approved";

            }


            if (
                status.toLowerCase()
                === "rejected"
            ) {

                statusClass =
                    "status-inactive";

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        leave.LeaveTypeName || "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        leave.FromDate
                    )}
                </td>

                <td>
                    ${formatDate(
                        leave.ToDate
                    )}
                </td>

                <td>
                    ${leave.TotalDays || 0}
                </td>

                <td>
                    ${escapeHtml(
                        leave.Reason || "-"
                    )}
                </td>

                <td>

                    <span class="
                        status
                        ${statusClass}
                    ">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* =========================================
   SALARY
========================================= */

async function loadSalary() {

    try {

        const result =
            await apiRequest(
                "/salary/salary/current"
            );


        const salary =
            result.data || result;


        document
            .getElementById(
                "monthlySalary"
            )
            .innerText =
            money(
                salary.monthlySalary
            );


        document
            .getElementById(
                "salaryAdvance"
            )
            .innerText =
            money(
                salary.totalAdvance
            );


        document
            .getElementById(
                "advanceDeduction"
            )
            .innerText =
            money(
                salary.advanceDeduction
            );


        document
            .getElementById(
                "remainingSalary"
            )
            .innerText =
            money(
                salary.netSalary
            );

    }
    catch (error) {

        console.error(
            "Salary error:",
            error
        );

    }

}


/* =========================================
   ADVANCE
========================================= */

async function loadAdvance() {

    const result =
        await apiRequest(
            "/employee/advances/current"
        );


    const data =
        result.data || result;


    document
        .getElementById(
            "totalAdvance"
        )
        .innerText =
        money(
            data.totalAdvance
        );


    document
        .getElementById(
            "advancePaid"
        )
        .innerText =
        money(
            data.advanceDeduction
        );


    document
        .getElementById(
            "remainingAdvance"
        )
        .innerText =
        money(
            data.remainingAdvance
        );


    const table =
        document.getElementById(
            "advanceTable"
        );


    const advances =
        data.advances || [];


    if (!advances.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    style="text-align:center">

                    या महिन्यात Advance नाही.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    advances.forEach(
        advance => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${formatDate(
                        advance.advanceDate
                    )}
                </td>

                <td>
                    ${money(
                        advance.amount
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        advance.remark || "-"
                    )}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* =========================================
   PRINT SALARY SLIP
========================================= */

async function printSalarySlip() {

    try {

        const result =
            await apiRequest(
                "/employee/salary/current"
            );


        const salary =
            result.data || result;


        const employeeName =
            currentEmployee?.EmployeeName ||
            "कर्मचारी";


        const printWindow =
            window.open(
                "",
                "_blank"
            );


        printWindow.document.write(`

            <!DOCTYPE html>

            <html lang="mr">

            <head>

                <meta charset="UTF-8">

                <title>
                    Salary Slip
                </title>

                <style>

                    body {
                        font-family: Arial,
                        sans-serif;
                        padding: 30px;
                    }

                    .salary-slip {
                        max-width: 700px;
                        margin: auto;
                        border: 1px solid #ddd;
                        padding: 25px;
                    }

                    h1, h2 {
                        text-align:center;
                    }

                    table {
                        width:100%;
                        border-collapse:collapse;
                        margin-top:20px;
                    }

                    td, th {
                        padding:10px;
                        border:1px solid #ddd;
                    }

                    .total {
                        font-weight:bold;
                    }

                </style>

            </head>

            <body>

                <div class="salary-slip">

                    <h1>
                        श्री साई बिझनेस
                    </h1>

                    <h2>
                        Salary Slip
                    </h2>

                    <hr>

                    <p>
                        <strong>
                            कर्मचारी:
                        </strong>
                        ${escapeHtml(employeeName)}
                    </p>

                    <p>
                        <strong>
                            कर्मचारी कोड:
                        </strong>
                        ${escapeHtml(
                            currentEmployee?.employeeCode || "-"
                        )}
                    </p>

                    <table>

                        <tr>
                            <td>
                                Monthly Salary
                            </td>

                            <td>
                                ${money(
                                    salary.monthlySalary
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Advance
                            </td>

                            <td>
                                ${money(
                                    salary.totalAdvance
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Advance Deduction
                            </td>

                            <td>
                                ${money(
                                    salary.advanceDeduction
                                )}
                            </td>
                        </tr>

                        <tr class="total">

                            <td>
                                Net Salary
                            </td>

                            <td>
                                ${money(
                                    salary.netSalary
                                )}
                            </td>

                        </tr>

                    </table>

                </div>

                <script>
                    window.print();
                <\/script>

            </body>

            </html>

        `);


        printWindow.document.close();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================
   HELPERS
========================================= */

function money(value) {

    return `₹${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2
        }
    )}`;

}


function formatDate(value) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return value;


    return date.toLocaleDateString(
        "en-IN"
    );

}


function formatDateTime(value) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return value;


    return date.toLocaleString(
        "en-IN"
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}