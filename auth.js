(function () {
    var STORAGE_KEY = "sc_content_v1";

    var user = null;
    try { user = JSON.parse(sessionStorage.getItem("sc_user")); } catch (e) {}

    // Not logged in -> back to login page
    if (!user) {
        location.replace("login.html#html");
        return;
    }

    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var pages = document.querySelectorAll(".page");
        var isTeacher = user.role === "teacher";

        // 1. Load content saved by the teacher (students see it too)
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            pages.forEach(function (p) {
                if (saved[p.id]) p.innerHTML = saved[p.id];
            });
        } catch (e) {}

        // 2. Top bar: role + logout
        var bar = document.createElement("div");
        bar.className = "userbar";

        var badge = document.createElement("span");
        badge.className = "role-badge " + user.role;
        badge.textContent = isTeacher ? "Teacher (can edit)" : "Student (view only)";

        var logout = document.createElement("button");
        logout.className = "logout-btn";
        logout.textContent = "Log out";
        logout.addEventListener("click", function () {
            sessionStorage.removeItem("sc_user");
            location.replace("login.html");
        });

        bar.appendChild(badge);
        bar.appendChild(logout);
        document.body.insertBefore(bar, document.body.firstChild);

        // 3. Students stop here: nothing is editable
        if (!isTeacher) return;

        // 4. Teacher edit tools
        var EDITABLE = "h2, h3, p, td, th, .notice-date";
        var editing = false;

        function setEditing(on) {
            editing = on;
            document.body.classList.toggle("editing", on);
            document.querySelectorAll(".page").forEach(function (p) {
                p.querySelectorAll(EDITABLE).forEach(function (el) {
                    if (on) el.setAttribute("contenteditable", "true");
                    else el.removeAttribute("contenteditable");
                });
            });
            editBtn.textContent = on ? "Stop Editing" : "Edit Page";
            saveBtn.style.display = on ? "inline-block" : "none";
        }

        function saveAll() {
            setEditing(false); // removes contenteditable before saving
            var data = {};
            document.querySelectorAll(".page").forEach(function (p) {
                data[p.id] = p.innerHTML;
            });
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                alert("Changes saved.");
            } catch (e) {
                alert("Could not save changes in this browser.");
            }
        }

        function resetAll() {
            if (confirm("Remove all edits and restore the original content?")) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        }

        var toolbar = document.createElement("div");
        toolbar.className = "edit-toolbar";

        var editBtn = document.createElement("button");
        editBtn.addEventListener("click", function () { setEditing(!editing); });

        var saveBtn = document.createElement("button");
        saveBtn.className = "save-btn";
        saveBtn.textContent = "Save Changes";
        saveBtn.style.display = "none";
        saveBtn.addEventListener("click", saveAll);

        var resetBtn = document.createElement("button");
        resetBtn.className = "reset-btn";
        resetBtn.textContent = "Reset";
        resetBtn.addEventListener("click", resetAll);

        toolbar.appendChild(editBtn);
        toolbar.appendChild(saveBtn);
        toolbar.appendChild(resetBtn);
        document.body.appendChild(toolbar);

        setEditing(false);
    });
})();