function showMessage(message, res) {
    var result = `<script>alert('${message}');history.back()</script>`;
    res.send(result)
}

module.exports = {
    showMessage
}