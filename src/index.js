import React from "react";
import ReactDOM from "react-dom";

// Обычно компоненты выносятся в разные файлы. Но не всегда
import TodoElement from "./TodoElement";
import RequestProvider from './API/RequestProvider';
import "./index.css";

class TodoList extends React.Component {
  // жизненные циклы должны быть наверху ъуъ
  componentDidMount() {
    // запрашиваем данные с fake-сервера
    RequestProvider.getList()
      .then((todos) => this.setState({ todo: todos }));
  }

  state = {
    valueInput: "",
    todo: [],
    filters: {
      title: '',
      completed: 'all'
    }
  }

  // все методы которые есть у дочерних компонентов я вынес наверх,
  // так как сверху имею полный контроль над происходящим (стейтом, переменными и тд)

  toggleDone = (id) => () => {
    // достаточно пройтись map'ом и обновить данные
    //
    const todo = this.state.todo.map((item) => {
      if (item.id === id) {
        const newItem = {
          ...item,
          completed: !item.completed,
        }
        
        RequestProvider.updateResource(newItem);
        return newItem;
      }
      return item;
    });

    this.setState({
      todo,
    });
  }

  saveTodoTitle = (id) => ({ title }) => {
    const todoList = this.state.todo;
    const todo = todoList.find(elem => {
      const result = elem.id === id;
      if(result) {
        elem.title = title;
      }
      return result;
    });

    RequestProvider.updateResource(todo);
    this.setState(() => {
      return {
        todo: todoList
      }
    })
  }

  deleteTodo = (id) => () => {
    // опять же, одной строкой убираем нужное. без слайсов.
    //
    const todo = this.state.todo.filter((elem) => elem.id !== id);
    RequestProvider.deleteResource(id);

    this.setState({ todo });
  }

  addNewTodo = async (event) => {
    event.preventDefault();
    // здесь в целом было всё ок
    const { valueInput, todo } = this.state;

    const newItem = await RequestProvider.createResource({
      title: valueInput,
      completed: false,
    });

    this.setState({
      todo: [...todo, newItem],
      valueInput: "",
    });
  }

  handleChange = (event) => {
    // добавляем атрибут "name" тэгу input
    // тем самым делаем код маштабируемым.
    const { name, value } = event.target;

    this.setState(() => {
      return { [name]: value }
    });
  }

  changeFilter = (event) => {
    const { filters } = this.state;
    const { name, value } = event.target;

    filters[name] = value;
    this.setState({
      filters: filters
    });
  }

  render() {
    const { todo, valueInput, filters } = this.state;
    return (
      <div className="todo">
        <form
          className="filter-todo"
          onSubmit={e => e.preventDefault()}
        >
          <input
            type="text"
            name="title"
            value={filters.title}
            onChange={this.changeFilter}
          />
          <label>
            <input
              type="radio"
              name="completed"
              value="all"
              checked={filters.completed === 'all'}
              onChange={this.changeFilter}
            />
            <span>Все</span>
          </label>
          <label>
            <input
              type="radio"
              name="completed"
              value="completed"
              checked={filters.completed === 'completed'}
              onChange={this.changeFilter}
            />
            <span>Выполненные</span>
          </label>
          <label>
            <input
              type="radio"
              name="completed"
              value="incomplete"
              checked={filters.completed === 'incomplete'}
              onChange={this.changeFilter}
            />
            <span>Невыполненные</span>
          </label>
        </form>
        <form className="add-todo" onSubmit={this.addNewTodo}>
          <input
            type="text"
            name="valueInput"
            placeholder="Введите значение"
            value={valueInput}
            onChange={this.handleChange}
          />
          <button onClick={this.addNewTodo}>Создать</button>
        </form>
        <ul>
          {todo.map((elem) => {
            const {filters} = this.state;
            const sampleString = new RegExp(filters.title);
            let completeFilter = true;
            if(sampleString.test(elem.title)) {
              switch (filters.completed) {
                case 'completed':
                  completeFilter = elem.completed;
                  break;
                case 'incomplete':
                  completeFilter = !elem.completed;
                  break;
                default: break;
              }
              if(completeFilter){
                return (
                  <TodoElement
                    item={elem}
                    onToggleDone={this.toggleDone(elem.id)}
                    onDelete={this.deleteTodo(elem.id)}
                    onSave={this.saveTodoTitle(elem.id)}
                    hidden={elem.hidden}
                    key={elem.id}
                  />
                )
              }
            }
          })}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(<TodoList />, document.getElementById("root"));
