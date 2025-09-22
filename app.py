from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/monthly-goal')
def monthly_goal():
    return render_template('monthly-goal.html')

@app.route('/daily-budget')
def daily_budget():
    return render_template('daily-budget.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

if __name__ == '__main__':
    app.run(debug=True)