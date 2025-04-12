import pandas as pd
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

templates = Jinja2Templates(directory="templates")
    
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.df = pd.read_csv("clean_data.csv")
    yield

app = FastAPI(lifespan=lifespan)

app.mount('/static', StaticFiles(directory='static'))

def find_by_rollno(df: pd.DataFrame, rollno: str) -> pd.DataFrame:
    return df[df['rollno'] == rollno.upper()]

def find_by_coursecode(df: pd.DataFrame, course_code: str) -> pd.DataFrame:
    filtered = df[df['coursecode'].str.upper() == course_code.upper()]
    grouped = filtered.groupby(['date', 'shift']).agg({
        'coursecode': 'first',
        'day': 'first',
        'roomno': lambda x: ', '.join(sorted(set(x)))
    }).reset_index()
    return grouped

@app.get("/student/{rollno}")
def get_student_by_rollno(rollno: str):
    df: pd.DataFrame = app.state.df  # Access the loaded DataFrame
    result = find_by_rollno(df, rollno)
    if result.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return result.to_dict(orient="records")

@app.get("/faculty/{coursecode}")
def get_faculty_by_coursecode(coursecode: str):
    df: pd.DataFrame = app.state.df
    result = find_by_coursecode(df , coursecode)
    if result.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return result.to_dict(orient="records")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("home.html", {
        "request": request
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)