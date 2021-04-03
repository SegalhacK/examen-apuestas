const { Router } = require('express');
const router = Router();

// IMPORTAMOS LA BASE DE DATOS DESDE EL ARCHIVO JS
const { User, Subasta } = require('../db');

// 2. Configuramos las rutas.
function checkLogin(req, res, next) {

    if (req.session.user == null) {
        req.flash('errors', "Debe ingresar para entrar a esta parte del sistema");
        return res.redirect('/login');
    }
    res.locals.user = req.session.user;
    next();
}

// function stopAuction(subasta) {
//     const
//     }
//     revisa cada producto
//         si hay productos sin apuestas
//             motrar error
//             redirigir al inicio
//         si todos tienen apuestas
//             next();
// }

router.get("/", checkLogin, async (req, res) => {
    const errors = req.flash("errors");
    const mensajes = req.flash("mensajes");
    const subastas = await Subasta.findAll({
        include: [{ model: User }],
        order: [['amount', 'DESC']]
    });

    res.render("main", { errors, mensajes, subastas })
});

router.post('/add', checkLogin, async (req, res) => {

    const { amount, product } = req.body
    const { id } = req.session.user

    try {
        // if (amount >= Subasta[0].amount) {
            await Subasta.create({
                amount: amount,
                product: product,
                UserId: id
            });
            
            req.flash("mensajes", "Apuesta agregada correctamente");
        // }

    } catch (err) {
        for (var key in err.errors) {
            req.flash('errors', err.errors[key].message);
        }
        return res.redirect('/');
    }

    return res.redirect("/");
});

router.get('/result', checkLogin, async (req, res) => {
    const winner = await Subasta.findAll({
        include: [{ model: User }],
        order: [['amount', 'DESC']]
    });
    
    const oferta1 = winner.filter(x=>x.product == 1);
    const oferta2 = winner.filter(x=>x.product == 2);  
    const oferta3 = winner.filter(x=>x.product == 3);
    const oferta4 = winner.filter(x=>x.product == 4);

    if (oferta1.length == 0 || oferta2.length == 0 || oferta3.length == 0 || oferta4.length == 0) {
        req.flash('errors', 'Tienes algún producto sin ofertar')
        return res.redirect('/');
    }

    const { name } = req.session.user
    res.render('result', { mensajes: [], errors: [], winner, name })
});

router.get('/clear', (req, res) => {
    Subasta.destroy
    res.redirect('/')
})
module.exports = router;
