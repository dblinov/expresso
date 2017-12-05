const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Lookup requested Menuitem and attaching to subsequent middleware
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: menuItemId};
    db.get(sql, values, (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
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
        price = req.body.menuItem.price;
  
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      }
  db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ( $name, $description, $inventory, $price, $menuId)`, { 
    $name: name, 
    $description: description, 
    $inventory: inventory,
    $price: price, 
    $menuId: req.params.menuId 
  }, function (error){
    if(error){ 
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
        res.status(201).json({menuItem: menuItem});
      });
    }
  });
});

// menuItemsRouter.post('/', (req, res, next) => {
//   const name = req.body.menuItem.name, 
//     description = req.body.menuItem.description,
//     inventory = req.body.menuItem.inventory,
//     price = req.body.menuItem.price,
//     menuId = req.body.menuItem.menuId;
//   const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
//   const menuValues = {$menuId: menuId};
//   db.get(menuSql, menuValues, (error, menu) => {
//     if (error) {
//       next(error);
//     } else {
//       if (!name || !description || !inventory || !price || !menu) {
//         return res.sendStatus(400);
//       }

//       const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
      
//       const values = {
//         $name: name,
//         $description: description,
//         $inventory: inventory,
//         $price: price,
//         $menuId: req.params.menuId
//       };
  
//       db.run(sql, values, function(error) {
//         if (error) {
//           next(error);
//         } else {
//           db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
//             (error, menuItem) => {
//               res.status(201).json({menuItem: menuItem});
//             });
//         }
//       });
//     }
//   });
// });

// Update Menu related Menuitem

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name, 
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
  
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      }
  db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId`, {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: req.params.menuItemId
  }, function (error){
    if(error){
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
(error, menuItem) => {
        res.status(200).json({ menuItem: menuItem});
      });
    }
  });
});

// menuItemsRouter.put('/:menuItemId', (req, res, next) => {
//     const name = req.body.menuItem.name,
//         description = req.body.menuItem.description,
//         inventory = req.body.menuItem.inventory,
//         price = req.body.menuItem.price,
//         menuId = req.body.menuItem.menuId;
//     const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
//     const menuValues = {$menuId: menuId};
//     db.get(menuSql, menuValues, (error, menu) => {
//       if (error) {
//         next(error);
//       } else {
//         if (!name || !description || !inventory || !price || !menu) {
//           return res.sendStatus(400);
//         }
  
//         const sql = 'UPDATE MenuItem SET name = $name, description = $description,  inventory = $inventory, price = $price WHERE MenuItem.id = $menuitemId';
//         const values = {
//           $name: name,
//           $description: description,
//           $inventory: inventory,
//           $price: price,
//           $menuitemId: req.params.menuitemId
//         };
  
//         db.run(sql, values, function(error) {
//           if (error) {
//             next(error);
//           } else {
//             db.get(`SELECT * FROM MenuItems WHERE MenuItem.id = ${req.params.menuitemId}`,
//               (error, menuItem) => {
//                 res.status(200).json({menuItem: menuItem});
//               });
//           }
//         });
//       }
//     });
// });


// Delete Menuitem
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: req.params.menuItemId};
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
});

module.exports = menuItemsRouter;