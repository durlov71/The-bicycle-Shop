//Modules
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const bicycles = require('./data/data.json')

//Server
const server = http.createServer(async(req, res) => {
    if (req.url === '/favicon.ico') return;
    //parsing Url
    const myUrl = new URL(req.url, `http://${req.headers.host}/`)
    const pathName = myUrl.pathname;
    const id = myUrl.searchParams.get('id');

    //Routes
    //Homepage
    if (pathName === '/') {
        let html = await fs.readFile('./views/bicycles.html', 'utf-8')
        const eachBicycles = await fs.readFile('./views/partials/bicycle.html', 'utf-8') //byclelist
        let allTheBicycle = '';
        for (let index = 0; index < 6; index++) {
            allTheBicycle += replaceTamplate(eachBicycles, bicycles[index])
        }
        html = html.replace(/<%allTheBicycles%>/g, allTheBicycle)

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)

        //Overview page
    } else if (pathName === '/bicycle' && id >= 0 && id <= 5) {
        let html = await fs.readFile('./views/overview.html', 'utf-8')
        const bicycle = bicycles.find((b) => b.id === id)

        html = replaceTamplate(html, bicycle);

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)


        //Images
    } else if (/\.(png)$/i.test(req.url)) {
        const img = await fs.readFile(`./public/images/${req.url.slice(1)}`)
        res.writeHead(200, { 'Content-Type': 'image/png' })
        res.end(img)

        //css
    } else if (/\.(css)$/i.test(req.url)) {
        const css = await fs.readFile(`./public/css/index.css`)
        res.writeHead(200, { 'Content-Type': 'text/css' })
        res.end(css)

        //svg
    } else if (/\.(svg)$/i.test(req.url)) {
        const svg = await fs.readFile(`./public/images/icons.svg`)
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
        res.end(svg)

        //NotFound
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end("<div><h2>File not Found</h2></div>")
    }

})

server.listen(3000);

//replace function
function replaceTamplate(html, bicycle) {
    html = html.replace(/<%IMAGE%>/g, bicycle.image) //dynamically img
    html = html.replace(/<%NAME%>/g, bicycle.name) ////dynamically name
    let price = bicycle.originalPrice
    if (bicycle.hasDiscount) {
        price = (price * (100 - bicycle.discount)) / 100;
    }
    html = html.replace(/<%NEWPRICE%>/g, `$${price}.00`) ////dynamically price
    html = html.replace(/<%OLDPRICE%>/g, `$${bicycle.originalPrice}.00`)
    html = html.replace(/<%ID%>/g, bicycle.id);
    if (bicycle.hasDiscount) {
        html = html.replace(/<%DISCOUNT%>/, `<div class="discount__rate">
        <p>${bicycle.discount} Off</p>
    </div>`)

    } else {
        html = html.replace(/<%DISCOUNT%>/g, "")
    }

    for (let index = 0; index < bicycle.star; index++) {
        html = html.replace(/<%STAR%>/, "checked")
    }
    html = html.replace(/<%STAR%>/g, "")


    return html;

}