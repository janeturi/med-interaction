/* api calls */

const BASE_URL = "http://localhost:8080/medication";

export async function checkInteractions(medications) { // async & await are used to connect the
    // networks together
  const res = await fetch(`${BASE_URL}/interactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medications }),
  });
  return res.json();
}

export async function getSideEffects(medications) {
  const res = await fetch(`${BASE_URL}/sideeffects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medications }),
  });
  return res.json();
}

export async function deleteMed(medication) { // 
    const res = await fetch(`${BASE_URL}/deleteMed/${medication}`, {
    method: "DELETE",
  });
  return res.text();
}

export async function getMeds(medications) {
  const res = await fetch(`${BASE_URL}/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medications }),
  });
  return res.json();
}