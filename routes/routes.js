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

    const { name } = req.session.user
    res.render('result', { mensajes: [], errors: [], winner, name })
});

module.exports = router;
