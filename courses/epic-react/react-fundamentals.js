const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.append(root);
const element = document.createElement("div");
element.textContent = "Hello World!";
element.className = "container";
root.append(element);
