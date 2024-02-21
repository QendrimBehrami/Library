document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".book").forEach((book) => {
    // Extract the number of pages read and total pages
    const total = parseInt(
      book.querySelector(".total-pages").textContent.split(": ")[1],
      10
    );
    const read = parseInt(
      book.querySelector(".pages-read").textContent.split(": ")[1],
      10
    );
    const readPercentage = (read / total) * 100;

    // Apply the read percentage to the --read-percentage custom property
    book.style.setProperty("--read-percentage", `${readPercentage}%`);
  });
});

let addButton = document.querySelector("#book-add");
addButton.addEventListener("click", () => {
  alert("Du stinkst!");
});
