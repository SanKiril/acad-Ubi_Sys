const loadData = async () => {
    // SERVER-CLIENT
    const response = await fetch('data/get');
    const data = await response.json();
    return data;
}