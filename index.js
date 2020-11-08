let data = []

const modal = document.querySelector(".modal");
M.Modal.init(modal);

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    let record = new FormData(form)

    record = Object.fromEntries(record);

    db.collection("employees").add(record);

    var instance = M.Modal.getInstance(modal);
    instance.close();

    form.reset();
});
