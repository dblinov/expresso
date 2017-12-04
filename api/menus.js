const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Connect menuitemsRouter !!!
const menuItemsRouter = require('./menuitems.js');
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// Lookup requested Menu and attaching to subsequent middleware
menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: menuId};
    db.get(sql, values, (error, menu) => {
      if (error) {
        next(error);
      } else if (menu) {
        req.menu = menu;
        next();
      } else {
        res.sendStatus(404);
      }
    });
});

// Get all Menus
menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

// Get specific Menu
menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

// Post new Menu
menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
  
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {$title: title};
  
    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
          (error, menu) => {
            res.status(201).json({menu: menu});
          });
      }
    });
});

// Update Menu
menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
  
    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = {
      $title: title,
      $menuId: req.params.menuId
    };
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
          (error, menu) => {
            res.status(200).json({menu: menu});
          });
      }
    });
});

// Delete Menu
menusRouter.delete('/:menuId', (req, res, next) => {
    const menuitemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const menuitemValues = {$menuId: req.params.menuId};
    db.get(menuitemSql, menuitemValues, (error, menuitem) => {
      if (error) {
        next(error);
      } else if (menuitem) {
        res.sendStatus(400);
      } else {
        const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
        const deleteValues = {$menuId: req.params.menuId};
  
        db.run(deleteSql, deleteValues, (error) => {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
          }
        });
      }
    });
});




module.exports = menusRouter;