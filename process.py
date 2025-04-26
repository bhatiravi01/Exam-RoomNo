import pandas as pd


df = pd.read_csv("end_sem_room.csv")
df.drop(columns=["Sl No"],axis=1,inplace=True)
df.head()
df['rollnolist'] = df['rollnolist'].str.strip(',') 
df['rollno'] = df['rollnolist'].str.split(',') 
df = df.explode('rollno')
df = df.drop(['rollnolist'] , axis=1)

df.to_csv("ese.csv", index=False)
df = pd.read_csv('ese.csv')

df_map = pd.read_csv('code_name_map.csv')
df3 = pd.DataFrame(columns=['Course Code', 'Course Name'])
for i in range(len(df_map)):
    item = df_map.iloc[i]
    # codes = ' OR '.join(item['Course Code'].split('/')).split(' OR ')
    codes = item['Course Code'].split('/')
    name = item['Course Name']
    for code in codes:
        df3 = pd.concat([pd.DataFrame(data=[{
            'Course Code': code,
            'Course Name': name
        }]), df3])
df3 = df3.drop_duplicates()
df3 = df3.set_index('Course Code')
def tmp(x):
    try:
        return df3.loc[x]['Course Name']
    except Exception:
        return ''
df['coursename'] = df['coursecode'].map(tmp)
mapped_percentage = ((df['coursename'] == '').sum() / len(df))*100
print(f"{mapped_percentage:.2f}% of the data is mapped to course names")
df.to_csv('clean_data.csv')