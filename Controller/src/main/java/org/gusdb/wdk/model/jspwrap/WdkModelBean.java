package org.gusdb.wdk.model.jspwrap;

import java.util.LinkedHashMap;
import java.util.Map;

import org.gusdb.wdk.model.Reference;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.record.RecordClass;
import org.gusdb.wdk.model.user.User;
import org.gusdb.wdk.model.xml.XmlQuestionSet;
import org.gusdb.wdk.model.xml.XmlRecordClassSet;

/**
 * A wrapper on a {@link WdkModel} that provides simplified access for
 * consumption by a view
 */
public class WdkModelBean {

    WdkModel wdkModel;

    public WdkModelBean(WdkModel wdkModel) {
        this.wdkModel = wdkModel;
    }

    public Map<String, String> getProperties() {
        return wdkModel.getProperties();
    }

    public String getVersion() {
        return wdkModel.getVersion();
    }

    public String getBuild() {
        return wdkModel.getBuildNumber();
    }

    public String getDisplayName() {
        return wdkModel.getDisplayName();
    }

    public String getIntroduction() {
        return wdkModel.getIntroduction();
    }

    // to do: figure out how to do this without using getModel()
    public WdkModel getModel() {
        return wdkModel;
    }

    public RecordClass[] getRecordClasses() {
      return wdkModel.getAllRecordClasses().toArray(new RecordClass[0]);
    }

    public XmlQuestionSetBean[] getXmlQuestionSets() {
        XmlQuestionSet[] qsets = wdkModel.getXmlQuestionSets();
        XmlQuestionSetBean[] qsetBeans = new XmlQuestionSetBean[qsets.length];
        for (int i = 0; i < qsets.length; i++) {
            qsetBeans[i] = new XmlQuestionSetBean(qsets[i]);
        }
        return qsetBeans;
    }

    /**
     * @return Map of questionSetName --> {@link XmlQuestionSetBean}
     */
    public Map<String, XmlQuestionSetBean> getXmlQuestionSetsMap() {
        XmlQuestionSetBean[] qSets = getXmlQuestionSets();
        Map<String, XmlQuestionSetBean> qSetsMap = new LinkedHashMap<String, XmlQuestionSetBean>();
        for (int i = 0; i < qSets.length; i++) {
            qSetsMap.put(qSets[i].getName(), qSets[i]);
        }
        return qSetsMap;
    }

    public XmlRecordClassSetBean[] getXmlRecordClassSets() {
        XmlRecordClassSet[] rcs = wdkModel.getXmlRecordClassSets();
        XmlRecordClassSetBean[] rcBeans = new XmlRecordClassSetBean[rcs.length];
        for (int i = 0; i < rcs.length; i++) {
            rcBeans[i] = new XmlRecordClassSetBean(rcs[i]);
        }
        return rcBeans;
    }

    public String getProjectId() {
        return wdkModel.getProjectId();
    }

    public String getName() {
        return wdkModel.getProjectId();
    }

    public String getSecretKey() {
        return wdkModel.getModelConfig().getSecretKey();
    }

    public boolean getUseWeights() {
        return wdkModel.getModelConfig().getUseWeights();
    }

    public User getSystemUser() {
        return wdkModel.getSystemUser();
    }

    /**
     * @return
     * @see org.gusdb.wdk.model.WdkModel#getReleaseDate()
     */
    public String getReleaseDate() {
        return wdkModel.getReleaseDate();
    }

    /**
     * Checks for a valid question name and throws WdkUserException if param is
     * not valid.  For now we simply check that it is a valid two-part name
     * (i.e. \S+\.\S+), so we will still get a WdkModelException down the line
     * if the question name is the correct format but does not actually exist.
     * We do this because sometimes developers change question names in one
     * place but not another and if so, then we want to know about it.  If we
     * mask this mistake with a WdkUserException, we might see bad consequences
     * down the line.
     * 
     * @param qFullName potential question name
     * @throws WdkUserException if name is not in format *.*
     */
    public void validateQuestionFullName(String qFullName) throws WdkUserException {
      String message = "The search '" + qFullName + "' is not or is no longer available.";
      try {
        // First check to see if this is a 'regular' question; if not, check XML questions
        if (qFullName == null || wdkModel.getQuestionByFullName(qFullName) == null) {
          throw new WdkModelException("Question name is null or resulting question is null");
        }
      }
      catch (WdkModelException e) {
        try {
          // exception will be thrown below; will mean that name is neither 'regular' question nor XML
          Reference r = new Reference(qFullName);
          XmlQuestionSet xqs = wdkModel.getXmlQuestionSet(r.getSetName());
          xqs.getQuestion(r.getElementName());
        }
        catch (WdkModelException e2) {
          throw new WdkUserException(message, e2);
        }
      }
    }
}
