package org.gusdb.wdk.controller.form;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;
import org.apache.struts.action.ActionForm;
import org.gusdb.wdk.controller.wizard.MapActionFormIfc;
import org.gusdb.wdk.model.Utilities;

public abstract class MapActionForm extends ActionForm implements MapActionFormIfc {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = Logger.getLogger(MapActionForm.class.getName());

    protected Map<String, Object> _values = new LinkedHashMap<String, Object>();
    protected Map<String, String[]> _arrays = new LinkedHashMap<String, String[]>();

    @Override
    public Map<String, Object> getValues() {
      return _values;
    }

    @Override
    public Object getValue(String key) {
        return _values.get(key);
    }

    @Override
    public void setValue(String key, Object value) {
        LOG.trace("set value: key=[" + key + "] value=[" + value + "]");
        _values.put(key, value);
    }

    @Override
    public Map<String, String[]> getArrays() {
      return _arrays;
    }

    public String[] getArray(String key) {
        return _arrays.get(key);
    }

    public void setArray(String key, String[] array) {
        LOG.trace("set array: key=[" + key + "] length=" + array.length
                + " array=" + Utilities.fromArray(array) + "");
        Set<String> values = new LinkedHashSet<String>();
        for (String value : array) {
            values.add(value);
        }
        _arrays.put(key, values.toArray(new String[0]));
    }

  @Override
  public Object getValueOrArray(String key) {
    // in the case some params set value into array, we need to get it from array too.
    Object value = _values.get(key);
    LOG.trace("key=" + key + ", value=" + value + ", isNull=" + (value == null));
    if (value == null) {
      String[] array = _arrays.get(key);
      if (array != null) {
        StringBuilder buffer = new StringBuilder();
        for (String val : array) {
          if (buffer.length() > 0)
            buffer.append(",");
          buffer.append(val);
        }
        value = buffer.toString();
      }
      LOG.trace("array_value=" + value + ", isNull=" + (value == null));
    }
    return value;
  }

    public void copyFrom(MapActionFormIfc form) {

        // total kluge here to copy the ActionServlet from one form to another
        setServlet(((MapActionForm)form).getServlet());

        _values.clear();
        for (String key : form.getValues().keySet()) {
            _values.put(key, form.getValues().get(key));
        }

        _arrays.clear();
        for (String key : form.getArrays().keySet()) {
            _arrays.put(key, form.getArrays().get(key));
        }
    }

    /**
     * The method is required by struts html tag-lib
     */
    public void reset() {
        LOG.debug("reset form");
        _arrays.clear();
        _values.clear();
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Printing out mapped form:\n");
        builder.append("Values:\n");
        for (String key : _values.keySet()) {
            builder.append("\t" + key + "=" + _values.get(key) + "\n");
        }
        builder.append("Arrays:\n");
        for (String key : _arrays.keySet()) {
            String[] array = _arrays.get(key);
            builder.append("\t" + key + "=[" + Utilities.fromArray(array)
                    + "]\n");
        }
        return builder.toString();
    }

    @Override
    public ServletContext getServletContext() {
      return getServlet().getServletContext();
    }
}