var uuid = require('uuid');
var _ = require('lodash');

function OrderServiceFactory(db, validator){
  function getAll(){
    return db('order')
      .select('order.id', 'order.createdAt', 'user.username', 'user.id as userId')
      .join('user', 'order.createdBy', 'user.id')
      .orderBy('createdAt', 'desc')
      .then(orders => orders.map(o => {
        return {
          id: o.id,
          createdAt: o.createdAt,
          createdBy: {
            id: o.userId,
            username: o.username
          }
        }
      }))
  }

  function getById(id){
    var res;
    return db('order').where({ id }).first()
      .then(order => {
        res = order;
        return db('order_dish')
          .join('dish', 'dishId', 'id')
          .select('id', 'name', 'price', 'amount')
          .where('orderId', id);
      })
      .then(dishes => {
        res.dishes = dishes;
        return res;
      });
  }

  function create(order){
    var newOrder = Object.assign({}, { id: uuid.v4() }, order);
    return _validateOrder(newOrder)
      .then(newOrder => {
        newOrder.createdAt = new Date(newOrder.createdAt);
        return db('order').insert(_.omit(newOrder, 'dishes'))
      })
      .then(order => _createOrderDishes(newOrder.id, newOrder.dishes))
      .then(() => newOrder);
  }

  function update(id, order){
    return _validateOrder(order)
      .then(order => db('order').where({ id }).update(_.omit(order, ['dishes', 'createdAt'])))
      .then((affectedRows) => _clearOrderDishes(id))
      .then((affectedRows) => _createOrderDishes(id, order.dishes))
      .then(() => order);
  }

  function deleteById(){

  }

  function _createOrderDishes(orderId, dishes){
    return db('order_dish')
      .insert(dishes.map(d => {
        return {
          orderId: orderId,
          dishId: d.id,
          amount: d.amount
        }
      }));
  }

  function _clearOrderDishes(id){
    return db('order_dish').where('orderId', id).delete();
  }

  function _validateOrder(order){
    var res = validator.validate('Order', order);
    return res.valid ? Promise.resolve(order) : Promise.reject(res.errors);
  }

  return {
    getAll,
    getById,
    create,
    update,
    deleteById
  }
}

module.exports = OrderServiceFactory;