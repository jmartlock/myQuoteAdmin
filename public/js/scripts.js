let authorLinks = document.querySelectorAll("a");
for (authorLink of authorLinks) {
    authorLink.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo(){
    var myModal = new bootstrap.Modal(document.getElementById('authorModal'));
    myModal.show();
 console.log(document.querySelector("#authorInfo"));
    let url = `/api/author/${this.id}`;
    let response = await fetch(url);
    let data = await response.json();

    let dob = new Date(data[0].dob).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    let dod = new Date(data[0].dod).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.querySelector("#authorInfo").innerHTML = `
        <h1>${data[0].firstName} ${data[0].lastName}</h1>
        <img src="${data[0].portrait}" width="300"><br>
        <p><strong>Biography:</strong> ${data[0].biography}</p>
        <p><strong>Country of Origin:</strong> ${data[0].country}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Date of Death:</strong> ${dod}</p>
        <p><strong>Profession:</strong> ${data[0].profession}</p>
        <p><strong>Sex:</strong> ${data[0].sex}</p>
    `;
}