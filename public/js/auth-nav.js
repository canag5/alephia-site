// auth-nav.js — adapte la navbar si l'utilisateur est déjà connecté
(async function () {
  try {
    const res = await fetch("/api/me");
    if (res.ok) {
      const data = await res.json();
      const nav = document.getElementById("navLinks");
      if (nav) {
        nav.innerHTML = `
          <a href="/espace.html" class="nav-ghost">Bonjour, ${data.user.name.split(" ")[0]}</a>
          <a href="/inscription.html" class="nav-fill">S'inscrire</a>
        `;
      }
    }
  } catch (e) {}
})();
