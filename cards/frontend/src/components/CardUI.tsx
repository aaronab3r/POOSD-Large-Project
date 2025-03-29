/*
    This file was used for testing while setting up the MERN stack.
    It is not indended to be used, but may serve as a useful source for changes we may make in the future.
    I think it may be worth keeping around, at least for the time being.
*/
import React, { useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';

function CardUI() 
{
    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud || '{}');
    var userId = ud.id;
    
    const [message, setMessage] = useState<string>('');
    const [searchResults, setResults] = useState<string>('');
    const [cardList, setCardList] = useState<string>('');
    const [search, setSearchValue] = useState<string>('');
    const [card, setCardNameValue] = useState<string>('');

    async function addCard(e: React.FormEvent<HTMLElement>): Promise<void> {
        e.preventDefault();

        let obj = { userId:userId, card:card, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/addcard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            let res = await response.json();
            //let res = JSON.parse(txt);

            if (res.error && res.error.length > 0) {
                setMessage("API Error:" + res.error);
            } else {
                setMessage('Card has been added');
            }

            // Store the jwt for future use
            if(obj.jwtToken != null) {
                storeToken(obj.jwtToken)
            }
        }
        catch (error: unknown) {
            setMessage(error instanceof Error ? error.toString() : String(error));
        }
    }

    async function searchCard(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();

        let obj = { userId:userId, search:search, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);
        let res: any;

        try {
            const response = await fetch(buildPath('api/searchcards'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            let res = await response.json();

            // Add null/undefined check for _results before accessing length
            let _results = res.results;
            let resultText = '';
            
            if(_results && Array.isArray(_results)) {
                for (let i = 0; i < _results.length; i++) {
                    resultText += _results[i];
                    if (i < _results.length - 1) {
                        resultText += ', ';
                    }
                }
            }
            
            setResults('Card(s) have been retrieved');
            setCardList(resultText);

            // Store the jwt for future use
            if(obj.jwtToken != null) {
                storeToken(obj.jwtToken)
            }
        }
        catch (e: any) {
            console.log(e.toString());
            setResults(e.toString());
            storeToken(res.jwtToken);
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