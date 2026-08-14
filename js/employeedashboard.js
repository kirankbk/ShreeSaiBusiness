
let currentEmployee = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            const user =
                getLoggedUser();


            if (!user) {

                return;

            }


            // if (
                // String(user.role)
                    // .toLowerCase()
                    // !== "employee"
            // ) {

                // window.location.href =
                    // "admin-dashboard.html";

                // return;

            // }


            //setTodayDate();


            await loadMyProfile();

            await loadTodayAttendance();

            await loadMonthlyAttendance();

            await loadMyLeaves();

           // await loadCurrentSalary();

           // await loadMyAdvances();

          //  await loadPaymentHistory();

        }
        catch (error) {

            console.error(
                "Employee dashboard error:",
                error
            );

        }

    }
);

/ ========================================
// SET TODAY DATE
// ========================================

function setTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    document
        .getElementById(
            "attendanceDate"
        )
        .value =
        `${year}-${month}-${day}`;

}

async function loadMyProfile() {

    try {

        const result =
            await apiRequest(
                "/employee/profile"
            );


        currentEmployee =
            result.data ||
            result;


        const employee =
            currentEmployee;


        document
            .getElementById(
                "employeeName"
            )
            .innerText =
            employee.EmployeeName ||
            employee.name ||
            "Employee";


        document
            .getElementById(
                "welcomeName"
            )
            .innerText =
            employee.EmployeeName ||
            employee.name ||
            "Employee";


        document
            .getElementById(
                "profileName"
            )
            .innerText =
            employee.EmployeeName ||
            employee.name ||
            "-";


        document
            .getElementById(
                "profileCode"
            )
            .innerText =
            employee.EmployeeCode ||
            "-";


        document
            .getElementById(
                "profileMobile"
            )
            .innerText =
            employee.mobile ||
            "-";


        document
            .getElementById(
                "profileBusiness"
            )
            .innerText =
            employee.businessType ||
            "-";


        document
            .getElementById(
                "businessName"
            )
            .innerText =
            employee.businessType ||
            "-";


        document
            .getElementById(
                "profileDesignation"
            )
            .innerText =
            employee.Designation ||
            "-";


        document
            .getElementById(
                "profileSalary"
            )
            .innerText =
            money(
                employee.MonthlySalary
            );

    }
    catch (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}
async function loadTodayAttendance() {

    try {

        const result =
            await apiRequest(
                "/attendance/daily/today"
            );


        const attendance =
            result.data ||
            result;


        if (!attendance) {

            setAttendanceNotMarked();

            return;

        }


        const status =
            attendance.status ||
            "Not Marked";


        document
            .getElementById(
                "todayAttendanceStatus"
            )
            .innerText =
            status;


        document
            .getElementById(
                "todayCheckIn"
            )
            .innerText =
            formatDateTime(
                attendance.CheckInTime
            );


        document
            .getElementById(
                "todayCheckOut"
            )
            .innerText =
            formatDateTime(
                attendance.CheckOutTime
            );


        updateAttendanceButtons(
            status,
            attendance
        );

    }
    catch (error) {

        console.error(
            "Today attendance error:",
            error
        );

    }

}

function updateAttendanceButtons(
    status,
    attendance
) {

    const checkIn =
        document.getElementById(
            "checkInButton"
        );


    const checkOut =
        document.getElementById(
            "checkOutButton"
        );


    if (
        attendance &&
        attendance.CheckInTime
    ) {

        checkIn.disabled =
            true;


        checkOut.disabled =
            Boolean(
                attendance.CheckOutTime
            );

    }
    else {

        checkIn.disabled =
            false;

        checkOut.disabled =
            true;

    }


    if (
        String(status)
            .toLowerCase()
            === "holiday"
    ) {

        checkIn.disabled =
            true;

        checkOut.disabled =
            true;

    }

}


async function checkIn() {

    const confirmed =
        confirm(
            "आजची Attendance Check-In करायची आहे का?"
        );


    if (!confirmed)
        return;


    try {

        await apiRequest(
            "/employee/attendance/check-in",
            {
                method: "POST"
            }
        );


        alert(
            "Check-In successfully saved."
        );


        await loadTodayAttendance();

        await loadMonthlyAttendance();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}
async function checkOut() {

    const confirmed =
        confirm(
            "आजची Check-Out करायची आहे का?"
        );


    if (!confirmed)
        return;


    try {

        await apiRequest(
            "/employee/attendance/check-out",
            {
                method: "POST"
            }
        );


        alert(
            "Check-Out successfully saved."
        );


        await loadTodayAttendance();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


//Monthly attendance
async function loadMonthlyAttendance() {

    try {

        const now =
            new Date();


        const month =
            now.getMonth() + 1;


        const year =
            now.getFullYear();


        const result =
            await apiRequest(
                `/attendance/monthly?month=${month}&year=${year}`
            );


        const attendance =
            Array.isArray(result)
                ? result
                : result.data || [];


        renderMonthlyAttendance(
            attendance
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}
function renderMonthlyAttendance(
    attendance
) {

    let present = 0;

    let absent = 0;

    let leave = 0;

    let holiday = 0;


    const table =
        document.getElementById(
            "monthlyAttendanceTable"
        );


    table.innerHTML = "";


    attendance.forEach(
        item => {

            const status =
                String(
                    item.Status || ""
                ).toLowerCase();


            if (status === "present")
                present++;

            else if (status === "absent")
                absent++;

            else if (status === "leave")
                leave++;

            else if (status === "holiday")
                holiday++;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${formatDate(
                        item.CalendarDate ||
                        item.date
                    )}
                </td>

                <td>
                    ${formatDateTime(
                        item.CheckInTime
                    )}
                </td>

                <td>
                    ${formatDateTime(
                        item.CheckOutTime
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        item.Status || "-"
                    )}
                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    document
        .getElementById(
            "monthlyPresent"
        )
        .innerText =
        present;


    document
        .getElementById(
            "monthlyAbsent"
        )
        .innerText =
        absent;


    document
        .getElementById(
            "monthlyLeave"
        )
        .innerText =
        leave;


    document
        .getElementById(
            "monthlyHoliday"
        )
        .innerText =
        holiday;

}
async function applyLeave() {

    const leaveType =
        document
            .getElementById(
                "leaveType"
            )
            .value;


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


    const reason =
        document
            .getElementById(
                "leaveReason"
            )
            .value
            .trim();


    if (!fromDate || !toDate) {

        alert(
            "From Date आणि To Date निवडा."
        );

        return;

    }


    if (
        new Date(toDate) <
        new Date(fromDate)
    ) {

        alert(
            "To Date ही From Date पेक्षा आधीची असू शकत नाही."
        );

        return;

    }


    try {

        await apiRequest(
            "/leaves",
            {

                method: "POST",

                body:
                    JSON.stringify({
                       employeeId:localStorage.getItem("EmployeeId"),
                        leaveType,

                        fromDate,

                        toDate,

                        reason

                    })

            }
        );


        alert(
            "Leave application successfully submitted."
        );


        document
            .getElementById(
                "leaveReason"
            )
            .value = "";


        await loadMyLeaves();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}

async function loadMyLeaves() {

    try {

        const result =
            await apiRequest(
                "leaves/employee/2"
            );


        const leaves =
            Array.isArray(result)
                ? result
                : result.data || [];


        const table =
            document.getElementById(
                "myLeaveTable"
            );


        table.innerHTML = "";


        if (!leaves.length) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center">

                        Leave application उपलब्ध नाही.

                    </td>

                </tr>

            `;

            return;

        }


        leaves.forEach(
            leave => {

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
                        ${leaveStatus(
                            leave.Status
                        )}
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Leave history:",
            error
        );

    }

}
function leaveStatus(
    status
) {

    const value =
        status || "Pending";


    let className =
        "status-pending";


    if (
        value === "Approved"
    ) {

        className =
            "status-approved";

    }


    if (
        value === "Rejected"
    ) {

        className =
            "status-inactive";

    }


    return `

        <span
            class="status ${className}">

            ${escapeHtml(value)}

        </span>

    `;

}

async function loadCurrentSalary() {

    try {

        const result =
            await apiRequest(
                "/salary/salary/current"
            );


        const salary =
            result.data ||
            result;


        document
            .getElementById(
                "salaryPeriod"
            )
            .innerText =
            `${salary.month}/${salary.year}`;


        document
            .getElementById(
                "currentMonthlySalary"
            )
            .innerText =
            money(
                salary.monthlySalary
            );


        document
            .getElementById(
                "currentPresentDays"
            )
            .innerText =
            salary.presentDays || 0;


        document
            .getElementById(
                "currentLeaveDays"
            )
            .innerText =
            salary.leaveDays || 0;


        document
            .getElementById(
                "currentHolidayDays"
            )
            .innerText =
            salary.holidayDays || 0;


        document
            .getElementById(
                "currentAdvance"
            )
            .innerText =
            money(
                salary.totalAdvance
            );


        document
            .getElementById(
                "currentNetSalary"
            )
            .innerText =
            money(
                salary.netSalary
            );


        document
            .getElementById(
                "currentSalaryStatus"
            )
            .innerText =
            salary.status || "-";

    }
    catch (error) {

        console.error(
            "Current salary error:",
            error
        );

    }

}

async function loadMyAdvances() {

    try {

        const result =
            await apiRequest(
                "/employee/advances/current"
            );


        const advances =
            Array.isArray(result)
                ? result
                : result.data || [];


        let total = 0;


        const table =
            document.getElementById(
                "myAdvanceTable"
            );


        table.innerHTML = "";


        advances.forEach(
            advance => {

                const amount =
                    Number(
                        advance.amount || 0
                    );


                if (
                    advance.status ===
                    "Active"
                ) {

                    total += amount;

                }


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
                            amount
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            advance.remark || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            advance.status || "-"
                        )}
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


        document
            .getElementById(
                "myTotalAdvance"
            )
            .innerText =
            money(total);


    }
    catch (error) {

        console.error(
            "Advance error:",
            error
        );

    }

}

async function loadPaymentHistory() {

    try {

        const result =
            await apiRequest(
                "/employee/salary/payments"
            );


        const payments =
            Array.isArray(result)
                ? result
                : result.data || [];


        const table =
            document.getElementById(
                "paymentHistoryTable"
            );


        table.innerHTML = "";


        if (!payments.length) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center">

                        Payment history उपलब्ध नाही.

                    </td>

                </tr>

            `;

            return;

        }


        payments.forEach(
            payment => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${payment.month || "-"}
                        /
                        ${payment.year || "-"}
                    </td>

                    <td>
                        ${money(
                            payment.netSalary
                        )}
                    </td>

                    <td>
                        ${money(
                            payment.amount
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            payment.paymentDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.paymentMode ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.referenceNo ||
                            "-"
                        )}
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Payment history error:",
            error
        );

    }

}