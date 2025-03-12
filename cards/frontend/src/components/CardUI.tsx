import React, { useState } from 'react';

function CardUI() {
    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud || '{}');
    var userId = ud?.id;
    
    const [message, setMessage] = useState<string>('');
    const [searchResults, setResults] = useState<string>('');
    const [cardList, setCardList] = useState<string>('');
    const [search, setSearchValue] = useState<string>('');
    const [card, setCardNameValue] = useState<string>('');

    const app_name = 'cop4331-1.online';
    function buildPath(route:string) : string
    {
        if (process.env.NODE_ENV != 'development')
        {
            return 'http://' + app_name + ':5000/' + route;
        }
        else
        {
            return 'http://localhost:5000/' + route;
        }
    }

    async function addCard(e: React.FormEvent<HTMLElement>): Promise<void> {
        e.preventDefault();

        let obj = { userId: userId, card: card };
        let js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/addcard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            let txt = await response.text();
            let res = JSON.parse(txt);

            if (res.error && res.error.length > 0) {
                setMessage("API Error:" + res.error);
            } else {
                setMessage('Card has been added');
            }
        }
        catch (error: unknown) {
            setMessage(error instanceof Error ? error.toString() : String(error));
        }
    }

    async function searchCard(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();

        let obj = { userId: userId, search: search };
        let js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/searchcards'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';
            
            for (let i = 0; i < _results.length; i++) {
                resultText += _results[i];
                if (i < _results.length - 1) {
                    resultText += ', ';
                }
            }
            
            setResults('Card(s) have been retrieved');
            setCardList(resultText);
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                setResults(error.toString());
            } else {
                setResults(String(error));
            }
        }
    }

    function handleSearchTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setSearchValue(e.target.value);
    }
    
    function handleCardTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setCardNameValue(e.target.value);
    }

    return (
        <div id="cardUIDiv">
            <br />
            Search: <input type="text" id="searchText" placeholder="Card To Search For" onChange={handleSearchTextChange} />
            <button type="button" id="searchCardButton" className="buttons" onClick={searchCard}> Search Card</button><br />
            <span id="cardSearchResult">{searchResults}</span>
            <p id="cardList">{cardList}</p><br /><br />
            Add: <input type="text" id="cardText" placeholder="Card To Add" onChange={handleCardTextChange} />
            <button type="button" id="addCardButton" className="buttons" onClick={addCard}> Add Card </button><br />
            <span id="cardAddResult">{message}</span>
        </div>
    );
}

export default CardUI;