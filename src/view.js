var marked = require("marked");
var fs = require("fs");
var hljs = require("highlight.js");

var TOS = fs.readFileSync("resources/TOS.md", "utf-8");
var pageTemplate = fs.readFileSync("resources/template.html", "utf-8");
var footerTemplate = fs.readFileSync("resources/footer.html", "utf-8");
var editTemplate = fs.readFileSync("resources/edit.html", "utf-8");
var header = fs.readFileSync(process.env.HEADER || "/dev/null", "utf-8");
var defaultBL = new Set();

var deriveTitle = text => text
  .split(/[\n\r]/)[0].slice(0,25)
  .replace(/[^a-zA-Z0-9\s]/g, "");

var renderPage = (id, title, content, footer, blackList) => pageTemplate
  .replace("%HEADER%", (blackList || defaultBL).has(id) ? header : "")
  .replace("%TITLE%", title)
  .replace("%CONTENT%", content.replace(/<meta.*?>/gi, "").replace(/<script[\s\S.]*?\/script>/gi, ""))
  .replace("%FOOTER%", footer || "");

var search = `
<div><label>Filter </label><input id="searchBox" type="text"></div>
<script>
$(function() {
var $notes = $('#notesList li');
$('#searchBox').keyup(function() {
    var re = new RegExp($(this).val(), "i"); // "i" means it's case-insensitive
    $notes.show().filter(function() {
        return !re.test($(this).text());
    }).hide();
});
});
</script>
`;
var notesList = (list) => {
    var component= search + '<ul id="notesList" class="notes-list">';
    list.forEach((note) => {
        component += `<li><a href="${note.id}">${deriveTitle(note.text)} -  ${note.id}</a></li>`;
    });
    component += '</ul>';
    return component;
};

var renderNotesList = (notes) => pageTemplate
    .replace("%HEADER%", "<div id='hero'><h1>All Notes</h1><div>")
  .replace("%TITLE%", "All notes")
  .replace("%FOOTER%", "<a href='/'>Homepage</a>")
  .replace("%CONTENT%", notesList(notes));

module.exports.renderNotesList = renderNotesList;
marked.setOptions({
  langPrefix: "hljs lang-",
  highlight: code => hljs.highlightAuto(code).value,
});

module.exports.renderPage = renderPage;

module.exports.renderStats = note => renderPage(note.id, deriveTitle(note.text),
  `<h2>Statistics</h2>
  <table>
    <tr><td>Published</td><td>${note.published}</td></tr>
    <tr><td>Edited</td><td>${note.edited || "N/A"}</td></tr>
    <tr><td>Views</td><td>${note.views}</td></tr>
  </table>`);

module.exports.renderTOS = () =>
  renderPage("tos", "Terms of Service", marked(TOS));

module.exports.renderNote = (note, blackList) => renderPage(note.id,
  deriveTitle(note.text),
  marked(note.text),
  footerTemplate.replace(/%LINK%/g, note.id),
  blackList);

module.exports.newNotePage = session => editTemplate
  .replace("%ACTION%", "POST")
  .replace("%SESSION%", session)
  .replace("%CONTENT%", "Loading...");

module.exports.editNotePage = (session, note) => editTemplate
  .replace("%ACTION%", "UPDATE")
  .replace("%SESSION%", session)
  .replace("%ID%", note.id)
  .replace("%CONTENT%", note.text);
