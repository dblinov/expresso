const express = require('express');

// Passing parameters to Parent Router
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Lookup requested Menuitem and attaching to subsequent middleware
menuItemsRouter.param('menuitemId', (req, res, next, menuitemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuitemId';
    const values = {$menuitemId: menuitemId};
    db.get(sql, values, (error, menuitem) => {
      if (error) {
        next(error);
      } else if (menuitem) {
        next();
      } else {
        res.sendStatus(404);
      }
    });
});

// Get Menu related Menuitems
menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const values = {$menuId: req.params.menuId};
    db.all(sql, values, (error, menuItems) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({menuItems: menuItems});
      }
    });
});

// Post new Menu related Menuitem
menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name, 
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price,
    menuId = req.body.menuItem.menuId;
  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuValues = {$menuId: menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price || !menu) {
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
      
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
      };
  
      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, menuItem) => {
              res.status(201).json({menuItem: menuItem});
            });
        }
      });
    }
  });
});

// Update Menu related Menuitem
menuItemsRouter.put('/:menuitemId', (req, res, next) => {
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.body.menuItem.menuId;
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};
    db.get(menuSql, menuValues, (error, menu) => {
      if (error) {
        next(error);
      } else {
        if (!name || !description || !inventory || !price || !menu) {
          return res.sendStatus(400);
        }
  
        const sql = 'UPDATE MenuItem SET name = $name, description = $description,  inventory = $inventory, price = $price WHERE MenuItem.id = $menuitemId';
        const values = {
          $name: name,
          $description: description,
          $inventory: inventory,
          $price: price,
          $menuitemId: req.params.menuitemId
        };
  
        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM MenuItems WHERE MenuItem.id = ${req.params.menuitemId}`,
              (error, menuItem) => {
                res.status(200).json({menuItem: menuItem});
              });
          }
        });
      }
    });
});


// Delete Menuitem
menuItemsRouter.delete('/:menuitemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuitemId';
    const values = {$menuitemId: req.params.menuitemId};
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
});

module.exports = menuItemsRouter;